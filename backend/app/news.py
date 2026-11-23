"""ЖОО-ға қатысты жаңалықтар: бірнеше RSS арнасынан жинап, сүзіп, кэштейді.

Тек тақырып, дереккөз атауы, күн және түпнұсқаға сілтеме сақталады —
мақала мәтіні көшірілмейді.
"""
from __future__ import annotations

import email.utils
import html
import json
import re
import threading
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

TTL = 60 * 60          # 1 сағат
TIMEOUT = 7
MAX_ITEMS = 80
CACHE_FILE = Path("/tmp/bilimizde_news.json")
UA = "Mozilla/5.0 (compatible; BilimIzdeNews/1.0; +https://bilimizde.onrender.com)"


def _unused_gnews(q: str, lang: str = "ru") -> str:
    hl = "ru" if lang == "ru" else "kk"
    return ("https://news.google.com/rss/search?q=" + urllib.parse.quote(q + " when:30d")
            + f"&hl={hl}&gl=KZ&ceid=KZ:{hl}")


FEEDS = [
    ("tengri", "https://tengrinews.kz/news.rss"),
    ("tengri-kk", "https://kaz.tengrinews.kz/news.rss"),
    ("inform-ru", "https://www.inform.kz/rss/ru.xml"),
    ("inform-kk", "https://www.inform.kz/rss/kk.xml"),
    ("zakon", "https://www.zakon.kz/rss/all.xml"),
    ("orda", "https://orda.kz/feed/"),
    ("kursiv", "https://kz.kursiv.media/feed/"),
    ("informburo", "https://informburo.kz/rss"),
    ("vlast", "https://vlast.kz/rss/"),
]
NAMES = {"tengri": "Tengrinews", "tengri-kk": "Tengrinews", "inform-ru": "Kazinform", "inform-kk": "Kazinform",
         "zakon": "Zakon.kz", "orda": "Orda.kz", "kursiv": "Kursiv", "informburo": "Informburo", "vlast": "Власть"}

# Аббревиатуралар — бас әріппен, бөлек сөз ретінде ғана («Президент» ішіндегі «ент» емес)
ABBR = r"\b(?:Болашак\w*|Болашақ\w*|ЕНТ|ҰБТ|ЖОО|ВУЗ\w*|МНВО|ҒЖБМ|НЦТ|ҰТО|КТ)\b"
WORDS = (r"\b(?:грант\w*|вуз\w*|универси\w*|абитуриент\w*|талапкер\w*|студент\w*|магистр\w*|докторант\w*|"
         r"бакалавр\w*|стипенди\w*|шәкіртақы\w*|высше\w* образовани\w*|жоғары білім\w*|Минобрнауки|"
         r"Министерств\w* науки и высшего|Ғылым және жоғары|Наццентр\w*|Национальн\w* центр\w* тестировани\w*|"
         r"Ұлттық тестілеу|поступлени\w*|оқуға түс\w*|ауылдық квот\w*|сельск\w* квот\w*|"
         r"выпускник\w*|түлек\w*)")
_abbr, _words = re.compile(ABBR), re.compile(WORDS, re.I)
DROP = re.compile(r"(футбол|хоккей|UFC|бокс|гороскоп|погод|ауа райы|курс валют|ДТП|убий|өлтір|колледж\w*|зейнетақ\w*|пенсион\w*|задерж\w*|ұсталды)", re.I)


def _keep(t: str) -> bool:
    return bool(_abbr.search(t) or _words.search(t))


TAGS = [
    ("grant", re.compile(r"\b(?:грант\w*|стипенди\w*|шәкіртақы\w*|Болаша\w*|\w* квот\w*)", re.I)),
    ("ent", re.compile(r"\b(?:ЕНТ|ҰБТ|НЦТ|ҰТО)\b|\b(?:Наццентр\w*|тестировани\w*|тестілеу\w*)", re.I if False else 0)),
    ("magistr", re.compile(r"\b(?:магистр\w*|докторант\w*|PhD)", re.I)),
    ("uni", re.compile(r"\b(?:ВУЗ\w*|ЖОО)\b|\b(?:вуз\w*|универси\w*|институт\w*|академи\w*)", re.I)),
]

_lock = threading.Lock()
_cache: dict = {"t": 0.0, "items": [], "status": {}}


def _fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/xml, text/xml"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.read(3_000_000)


def _text(el, tag: str) -> str:
    x = el.find(tag)
    return (x.text or "").strip() if x is not None and x.text else ""


def _parse(feed: str, raw: bytes) -> list[dict]:
    root = ET.fromstring(raw)
    out = []
    for it in root.iter("item"):
        title = html.unescape(_text(it, "title"))
        link = _text(it, "link")
        if not title or not link.startswith("http"):
            continue
        src_el = it.find("source")
        source = (src_el.text or "").strip() if src_el is not None and src_el.text else ""
        if source and title.endswith(" - " + source):
            title = title[: -len(source) - 3].strip()
        if not source:
            source = NAMES.get(feed, "")
        ts = 0
        pd = _text(it, "pubDate")
        if pd:
            try:
                ts = int(email.utils.parsedate_to_datetime(pd).timestamp())
            except Exception:
                ts = 0
        out.append({"title": title, "link": link, "source": source, "ts": ts})
    return out


def _norm(t: str) -> str:
    return re.sub(r"[^\w]+", " ", t.lower()).strip()[:90]


def _lang(t: str) -> str:
    return "kk" if re.search(r"[әғқңөұүһі]", t, re.I) else "ru"


def _refresh() -> None:
    items, status, seen = [], {}, set()
    now = time.time()
    def one(f):
        name, url = f
        try:
            return name, _parse(name, _fetch(url)), None
        except Exception as e:  # дереккөз істемесе — өткізіп жібереміз
            return name, [], "err: " + type(e).__name__

    with ThreadPoolExecutor(max_workers=len(FEEDS)) as ex:
        results = list(ex.map(one, FEEDS))
    for name, got, err in results:
        status[name] = err or len(got)
        for x in got:
            if not _keep(x["title"]) or DROP.search(x["title"]):
                continue
            if x["ts"] and now - x["ts"] > 45 * 86400:
                continue
            k = _norm(x["title"])
            if k in seen or x["link"] in seen:
                continue
            seen.update((k, x["link"]))
            x["tags"] = [t for t, rx in TAGS if rx.search(x["title"])] or ["uni"]
            x["lang"] = _lang(x["title"])
            items.append(x)
    for x in _cache["items"]:  # бұрынғы жиналғандарды да сақтаймыз
        if x["link"] in seen or _norm(x["title"]) in seen:
            continue
        if not _keep(x["title"]) or DROP.search(x["title"]) or (x["ts"] and now - x["ts"] > 45 * 86400):
            continue
        seen.update((_norm(x["title"]), x["link"]))
        items.append(x)
    items.sort(key=lambda x: x["ts"], reverse=True)
    items = items[:MAX_ITEMS]
    if items:
        _cache.update(t=now, items=items, status=status)
        try:
            CACHE_FILE.write_text(json.dumps({"t": now, "items": items}, ensure_ascii=False))
        except Exception:
            pass
    else:
        _cache.update(t=now - TTL + 600, status=status)  # 10 минуттан соң қайта көреміз


def get_news() -> dict:
    if not _cache["items"] and CACHE_FILE.exists():
        try:
            d = json.loads(CACHE_FILE.read_text())
            _cache.update(t=d.get("t", 0), items=d.get("items", []))
        except Exception:
            pass
    if time.time() - _cache["t"] > TTL and _lock.acquire(blocking=False):
        def job():
            try:
                _refresh()
            finally:
                _lock.release()
        if _cache["items"]:
            threading.Thread(target=job, daemon=True).start()  # ескісін бірден береміз
        else:
            job()
    return {"updated": int(_cache["t"]), "items": _cache["items"], "status": _cache["status"]}
