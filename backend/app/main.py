"""BilimIzde backend (FastAPI).

- Мамандықтар, ЖОО-лар, гранттар, шетелдік университеттер туралы мәліметтерді API арқылы береді.
- «Клуб» бөлімінің пікірлерін SQLite базасында сақтайды (барлық қолданушыларға ортақ).
- AI көмекшісіне /api/ask арқылы нақты тіл моделін қосады (ANTHROPIC_API_KEY берілсе).
- frontend/ папкасындағы сайтты көрсетеді.
"""
from __future__ import annotations

import json
import os
import re
import sqlite3
import time
import urllib.error
import urllib.request
from collections import defaultdict, deque
from functools import lru_cache
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
FRONTEND_DIR = BASE_DIR.parent.parent / "frontend"
DB_PATH = Path(os.environ.get("BZ_DB_PATH", BASE_DIR.parent / "bilimizde.db"))

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "").strip()
AI_MODEL = os.environ.get("BZ_AI_MODEL", "claude-haiku-5-5")

MIN_SCORE, MAX_SCORE = 0, 140


# ---------------- Мәліметтер ----------------

@lru_cache
def load(name: str):
    with open(DATA_DIR / f"{name}.json", encoding="utf-8") as f:
        return json.load(f)


def majors() -> list[dict]:
    return load("majors")


def universities() -> list[dict]:
    return load("universities")


def foreign() -> list[dict]:
    return load("foreign")


def fields() -> dict:
    return load("fields")


def sites() -> dict:
    return load("sites")


def field_of(code: str) -> Optional[str]:
    """Мамандық шифры бойынша білім саласын анықтайды (frontend-тегі fieldOf-пен бірдей)."""
    n = int(re.sub(r"\D", "", code) or 0)
    if code.startswith("BM"):
        return "health"
    if n in (134, 135, 234):
        return "hum"
    if n in (140, 142):
        return "soc"
    if n == 145:
        return "bus"
    if n == 158:
        return "ict"
    if n == 157:
        return None
    if n == 183:
        return "agr"
    if n in (126, 161, 162, 165, 166, 167, 171, 172, 173, 174, 175, 176, 271):
        return "eng"
    for limit, key in ((20, "ped"), (31, "art"), (37, "hum"), (43, "soc"), (49, "bus"),
                       (56, "nat"), (59, "ict"), (76, "eng"), (82, "agr")):
        if n <= limit:
            return key
    if n == 83:
        return "vet"
    if n <= 89:
        return "health"
    return "serv"


def is_creative(m: dict) -> bool:
    return (m.get("combo") or "").startswith("Шығарма")


def threshold(m: dict) -> int:
    return int(m["grantScore"])


def match_major(m: dict, q: str) -> bool:
    return q in m["name"].lower() or q in m["code"].lower() or q in (m.get("combo") or "").lower()


def match_uni(u: dict, q: str) -> bool:
    return q in u["name"].lower() or q in u["code"] or q in u["city"].lower()


def match_foreign(f: dict, q: str) -> bool:
    return q in " ".join([f["name"], f["kz"], f["country"], f["city"]]).lower()


def major_detail(m: dict) -> dict:
    code = m["code"]
    key = field_of(code)
    f = fields().get(key) if key else None
    g25, g26 = load("grants_2025").get(code), load("grants_2026").get(code)
    return {
        **m,
        "creative": is_creative(m),
        "field": {"key": key, "name": f[0], "about": f[1], "career": f[2]} if f else None,
        "grants": {
            "2025": {"full": g25[0], "reduced": g25[1], "quota": g25[2]} if g25 else None,
            "2026": {"total": g26[0], "full": g26[1], "reduced": g26[2]} if g26 else None,
            "other_years": load("grants_other_years").get(code),
        },
        "passing_scores": load("passing_scores").get(code),
        "universities": load("major_universities").get(code),
    }


def uni_detail(u: dict) -> dict:
    code = u["code"]
    return {**u, "site": sites().get(code), "other_sites": load("site_extra").get(code, [])}


# ---------------- Клуб (SQLite) ----------------

def db() -> sqlite3.Connection:
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with db() as con:
        con.execute(
            """CREATE TABLE IF NOT EXISTS club_posts (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   topic TEXT NOT NULL,
                   text TEXT NOT NULL,
                   created_at TEXT NOT NULL DEFAULT (datetime('now'))
               )"""
        )


def club_count() -> int:
    with db() as con:
        return con.execute("SELECT COUNT(*) FROM club_posts").fetchone()[0]


# Бір IP-ден 10 минутта 5 жазбадан артық емес (спамнан қорғау)
_RATE: dict[str, deque] = defaultdict(deque)
RATE_LIMIT, RATE_WINDOW = 5, 600


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() or (request.client.host if request.client else "?")


def check_rate(ip: str, limit: int = RATE_LIMIT, window: int = RATE_WINDOW, bucket: str = "club") -> None:
    now = time.time()
    q = _RATE[bucket + ip]
    while q and now - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        raise HTTPException(429, "Тым жиі сұраныс. Біраз күте тұрыңыз.")
    q.append(now)


class ClubPost(BaseModel):
    topic: str = Field("Пікір", max_length=80)
    text: str = Field(..., min_length=1, max_length=600)


class AskBody(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)
    context: list[str] = Field(default_factory=list, max_length=6)


AI_SYSTEM = (
    "Сен BilimIzde порталының AI кеңесшісісің. Қазақстандағы және шетелдегі университеттер, "
    "мамандықтар, ҰБТ, гранттар туралы талапкерлерге көмектесесің. Пайдаланушы қай тілде жазса "
    "(қазақша, орысша, ағылшынша), сол тілде жауап бер. Берілген контекстегі мәліметтерге сүйен; "
    "нақты сан немесе мерзім білмесең, ойдан шығарма, ресми сайттан тексеруге кеңес бер. "
    "Жауапты қысқа әрі нақты жаз (5–8 сөйлемнен аспасын), HTML белгілерін қолданба."
)


def ask_llm(question: str, context: list[str]) -> str:
    ctx = "\n\n".join(c[:1500] for c in context[:6])
    payload = {
        "model": AI_MODEL,
        "max_tokens": 700,
        "system": AI_SYSTEM,
        "messages": [{
            "role": "user",
            "content": (f"Контекст (BilimIzde базасынан):\n{ctx}\n\n" if ctx else "") + f"Сұрақ: {question}",
        }],
    }
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps(payload).encode(),
        headers={
            "content-type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=40) as r:
        data = json.load(r)
    return "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text").strip()


# ---------------- Қосымша ----------------

app = FastAPI(
    title="BilimIzde API",
    description="Қазақстан ЖОО-лары, мамандықтары, гранттары және шетелдік университеттер туралы API",
    version="2.0.0",
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET", "POST"], allow_headers=["*"])
init_db()


@app.get("/api/health", tags=["Жүйе"])
def health():
    return {"status": "ok", "ai_enabled": bool(ANTHROPIC_API_KEY)}


@app.get("/api/bootstrap", tags=["Жүйе"])
def bootstrap():
    """Сайт ашылғанда керек барлық мәлімет бір сұраныспен."""
    names = ["majors", "universities", "fields", "sites", "site_extra", "grants_2025", "grants_other_years",
             "grants_2026", "quotas_2026", "quota_names_2026", "passing_scores", "major_universities",
             "foreign", "foreign_wiki", "foreign_history", "faq"]
    return {**{n: load(n) for n in names}, "ai_enabled": bool(ANTHROPIC_API_KEY), "club_count": club_count()}


@app.get("/api/stats", tags=["Жүйе"])
def stats():
    by_score: dict[str, int] = {}
    for m in majors():
        by_score[m["grantScore"]] = by_score.get(m["grantScore"], 0) + 1
    return {
        "majors": len(majors()),
        "universities": len(universities()),
        "foreign": len(foreign()),
        "majors_by_threshold": by_score,
        "grants_2026_total": sum(v[0] for v in load("grants_2026").values()),
        "club_posts": club_count(),
    }


@app.get("/api/search", tags=["Іздеу"])
def search(q: str = ""):
    """Мамандықтар, Қазақстан ЖОО-лары және шетелдік университеттер бойынша іздеу."""
    q = q.strip().lower()
    return {
        "majors": [m for m in majors() if match_major(m, q)],
        "universities": [u for u in universities() if match_uni(u, q)],
        "foreign": [f for f in foreign() if match_foreign(f, q)],
    }


# --- Мамандықтар ---

@app.get("/api/majors", tags=["Мамандықтар"])
def list_majors(
    q: str = "",
    field: Optional[str] = Query(None, description="Сала: ped, art, hum, soc, bus, nat, ict, eng, agr, vet, health, serv"),
    max_threshold: Optional[int] = Query(None, ge=MIN_SCORE, le=MAX_SCORE),
):
    q = q.strip().lower()
    res = [m for m in majors() if match_major(m, q)]
    if field:
        res = [m for m in res if field_of(m["code"]) == field]
    if max_threshold is not None:
        res = [m for m in res if threshold(m) <= max_threshold]
    return res


@app.get("/api/majors/{code}", tags=["Мамандықтар"])
def get_major(code: str):
    """Мамандық: сала, 2025/2026 грант саны, өту балдары, ЖОО бойынша кесте."""
    for m in majors():
        if m["code"].lower() == code.lower():
            return major_detail(m)
    raise HTTPException(404, "Мамандық табылмады")


@app.get("/api/fields", tags=["Мамандықтар"])
def list_fields():
    q26, q26n = load("quotas_2026"), load("quota_names_2026")
    return [{"key": k, "name": v[0], "about": v[1], "career": v[2],
             "quota_2026": q26.get(k), "quota_group_2026": q26n.get(k)} for k, v in fields().items()]


@app.get("/api/grant-check", tags=["Мамандықтар"])
def grant_check(score: int = Query(..., ge=MIN_SCORE, le=MAX_SCORE, description="ҰБТ жалпы балы")):
    """ҰБТ балы бойынша шектік балға жететін мамандықтар."""
    ok = [m for m in majors() if not is_creative(m) and score >= threshold(m)]
    creative = [m for m in majors() if is_creative(m) and score >= threshold(m)]
    return {"score": score, "eligible": ok, "creative": creative}


# --- Университеттер ---

@app.get("/api/universities", tags=["Университеттер"])
def list_universities(q: str = "", city: Optional[str] = None, type: Optional[str] = None):
    q = q.strip().lower()
    res = [u for u in universities() if match_uni(u, q)]
    if city:
        res = [u for u in res if u["city"].lower() == city.lower()]
    if type:
        res = [u for u in res if type.lower() in u.get("type", "").lower()]
    return [uni_detail(u) for u in res]


@app.get("/api/universities/{code}", tags=["Университеттер"])
def get_university(code: str):
    for u in universities():
        if u["code"] == code:
            return uni_detail(u)
    raise HTTPException(404, "Университет табылмады")


@app.get("/api/cities", tags=["Университеттер"])
def list_cities():
    return sorted({u["city"] for u in universities()})


# --- Шетелдік ЖОО ---

@app.get("/api/foreign", tags=["Шетелдік ЖОО"])
def list_foreign(q: str = "", country: Optional[str] = None):
    q = q.strip().lower()
    res = [f for f in foreign() if match_foreign(f, q)]
    if country:
        res = [f for f in res if f["country"] == country]
    return res


@app.get("/api/foreign/{fid}", tags=["Шетелдік ЖОО"])
def get_foreign(fid: str):
    for f in foreign():
        if f["id"] == fid:
            h = load("foreign_history").get(fid)
            return {**f, "history": {"summary": h[0], "timeline": h[1]} if h else None,
                    "wikipedia": load("foreign_wiki").get(fid)}
    raise HTTPException(404, "Университет табылмады")


@app.get("/api/faq", tags=["AI"])
def faq():
    return [{"keywords": k, "answer": a} for k, a in load("faq")]


# --- AI ---

@app.post("/api/ask", tags=["AI"])
def ask(body: AskBody, request: Request):
    """AI көмекшісі: сайттағы базадан табылмаған сұрақтарға тіл моделі жауап береді."""
    if not ANTHROPIC_API_KEY:
        raise HTTPException(503, "AI қосылмаған (ANTHROPIC_API_KEY берілмеген)")
    check_rate(client_ip(request), limit=20, window=600, bucket="ai")
    try:
        answer = ask_llm(body.question, body.context)
    except (urllib.error.URLError, TimeoutError, ValueError) as e:
        raise HTTPException(502, f"AI сервисі жауап бермеді: {e}")
    return {"answer": answer}


# --- Клуб ---

@app.get("/api/club", tags=["Клуб"])
def club_list(limit: int = Query(100, ge=1, le=500)):
    with db() as con:
        rows = con.execute(
            "SELECT id, topic, text, created_at FROM club_posts ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
    return [dict(r) for r in rows]


@app.post("/api/club", tags=["Клуб"], status_code=201)
def club_add(post: ClubPost, request: Request):
    topic, text = post.topic.strip() or "Пікір", post.text.strip()
    if not text:
        raise HTTPException(422, "Мәтін бос")
    check_rate(client_ip(request))
    with db() as con:
        cur = con.execute("INSERT INTO club_posts (topic, text) VALUES (?, ?)", (topic, text))
        row = con.execute("SELECT id, topic, text, created_at FROM club_posts WHERE id = ?",
                          (cur.lastrowid,)).fetchone()
    return dict(row)


# Frontend (сайттың өзі) — API маршруттарынан кейін тіркеледі
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
