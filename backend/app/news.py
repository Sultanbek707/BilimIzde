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
TIMEOUT = 8
MAX_ITEMS = 80
CACHE_FILE = Path("/tmp/bilimizde_news.json")
UA = "Mozilla/5.0 (compatible; BilimIzdeNews/1.0; +https://bilimizde.onrender.com)"


def _gnews(q: str, lang: str = "ru") -> str:
    hl = "ru" if lang == "ru" else "kk"
    return ("https://news.google.com/rss/search?q=" + urllib.parse.quote(q + " when:30d")
            + f"&hl={hl}&gl=KZ&ceid=KZ:{hl}")


FEEDS = [
    ("gn-grant", _gnews("грант ЕНТ вуз Казахстан")),
    ("gn-ent", _gnews("ЕНТ 2027 Национальный центр тестирования")),
    ("gn-vuz", _gnews("вузы Казахстана Минобрнауки")),
    ("gn-magistr", _gnews("магистратура Казахстан грант")),
    ("gn-kk-grant", _gnews("ҰБТ грант ЖОО", "kk")),
    ("gn-kk-uni", _gnews("университет Ғылым және жоғары білім министрлігі", "kk")),
    ("tengri", "https://tengrinews.kz/news.rss"),
    ("inform-ru", "https://www.inform.kz/rss/ru.xml"),
    ("inform-kz", "https://www.inform.kz/rss/kz.xml"),
]

# Тақырыпта осы сөздердің біреуі болса ғана аламыз
KEEP = re.compile(
    r"(ЕНТ|ҰБТ|грант|вуз|ВУЗ|ЖОО|универси|абитуриент|талапкер|студент|магистр|"
    r"докторантур|бакалавр|стипенди|шәкіртақы|высш\w* образован|жоғары білім|"
    r"Минобрнауки|МНВО|ҒЖБМ|Ғылым және жоғары|тестирован|тестілеу|Болашак|Болашақ|"
    r"колледж|оқу орн|учебн\w* завед|поступ|түсу|квот)", re.I)
DROP = re.compile(r"(футбол|хоккей|гороскоп|погода|ауа райы|курс валют|ДТП|убий|өлтір)", re.I)

TAGS = [
    ("grant", re.compile(r"(грант|квот|стипенди|шәкіртақы|Болаша)", re.I)),
    ("ent", re.compile(r"(ЕНТ|ҰБТ|тестирован|тестілеу|НЦТ|ҰТО)", re.I)),
    ("magistr", re.compile(r"(магистр|докторант|PhD)", re.I)),
    ("uni", re.compile(r"(вуз|ВУЗ|ЖОО|универси|институт|академи)", re.I)),
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
            source = {"tengri": "Tengrinews", "inform-ru": "Kazinform", "inform-kz": "Kazinform"}.get(feed, "")
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
            if not KEEP.search(x["title"]) or DROP.search(x["title"]):
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
