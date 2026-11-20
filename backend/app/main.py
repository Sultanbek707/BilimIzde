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
import datetime as dt
import hashlib
import html as htmlmod
import time
import urllib.error
import urllib.request
from collections import defaultdict, deque
from functools import lru_cache
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Header, HTTPException, Query, Request
from fastapi.responses import HTMLResponse, PlainTextResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from . import auth, db, telegram_bot

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
FRONTEND_DIR = BASE_DIR.parent.parent / "frontend"
SITE_URL = os.environ.get("BZ_SITE_URL", "").rstrip("/")
ADMIN_KEY = os.environ.get("BZ_ADMIN_KEY", "").strip()

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
        "salary_sector": (lambda sal, k: {**sal["sectors"][k], "key": k, "period": sal["period"], "source": sal["source"]}
                          if k else None)(load("salaries"), load("salaries")["major_sector"].get(code)),
        "field": {"key": key, "name": f[0], "about": f[1], "career": f[2]} if f else None,
        "grants": {
            "2025": {"full": g25[0], "reduced": g25[1], "quota": g25[2]} if g25 else None,
            "2026": {"total": g26[0], "full": g26[1], "reduced": g26[2]} if g26 else None,
            "other_years": load("grants_other_years").get(code),
        },
        "passing_scores": load("passing_scores").get(code),
        "universities": load("major_universities").get(code),
        "offered_by": offering_universities(code),
    }


def uni_extra(code: str) -> dict:
    return load("university_extra")["universities"].get(code, {})


def uni_detail(u: dict) -> dict:
    code = u["code"]
    ex = uni_extra(code)
    return {**u, "site": sites().get(code), "other_sites": load("site_extra").get(code, []),
            "programs": ex.get("programs", []), "programs_source": ex.get("programs_src"),
            "dormitory": ex.get("dorm"), "dormitory_source": ex.get("dorm_src"),
            "military_department": ex.get("military"), "military_source": ex.get("military_src"),
            "rankings": load("rankings")["universities"].get(code)}


def offering_universities(code: str) -> list[dict]:
    """Мамандықты оқытатын ЖОО-лар (ЕПВО тізілімі бойынша)."""
    ux = load("university_extra")["universities"]
    return [{"code": u["code"], "name": u["name"], "city": u["city"]}
            for u in universities() if code in ux.get(u["code"], {}).get("programs", [])]


# ---------------- Дерекқор ----------------

def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def club_count() -> int:
    r = db.one("SELECT COUNT(*) AS n FROM club_posts")
    return int(r["n"]) if r else 0


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


@app.middleware("http")
async def no_stale_frontend(request, call_next):
    """Браузер ескі JS/CSS көрсетпесін: әр жолы сервермен тексереді (ETag)."""
    resp = await call_next(request)
    if not request.url.path.startswith("/api/"):
        resp.headers["Cache-Control"] = "no-cache"
    return resp
db.init()


@app.get("/api/health", tags=["Жүйе"])
def health():
    return {"status": "ok", "ai_enabled": bool(ANTHROPIC_API_KEY)}


@app.get("/api/bootstrap", tags=["Жүйе"])
def bootstrap(lang: str = "kk"):
    """Сайт ашылғанда керек барлық мәлімет бір сұраныспен. lang=ru|en болса, шетелдік ЖОО аудармасы да қосылады."""
    names = ["majors", "universities", "fields", "sites", "site_extra", "logos", "grants_2025", "grants_other_years",
             "grants_2026", "quotas_2026", "quota_names_2026", "passing_scores", "major_universities",
             "foreign", "foreign_wiki", "foreign_history", "faq", "university_extra", "i18n",
             "rankings", "salaries"]
    out = {n: load(n) for n in names}
    if lang in ("ru", "en"):
        out["foreign_i18n"] = {k: v.get(lang) for k, v in load("foreign_i18n").items()}
    return {**out, "ai_enabled": bool(ANTHROPIC_API_KEY), "club_count": club_count()}


@app.get("/api/salaries", tags=["Деректер"])
def salaries_api():
    """Салалар бойынша орташа айлық жалақы (Ұлттық статистика бюросы)."""
    return load("salaries")


@app.get("/api/rankings", tags=["Деректер"])
def rankings_api():
    """QS рейтингтеріндегі Қазақстан ЖОО-лары."""
    return load("rankings")


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


# --- Тіркелу (Firebase) ---

def current_user(authorization: Optional[str]) -> Optional[dict]:
    """Authorization: Bearer <Firebase ID token> болса, қолданушыны қайтарады."""
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    try:
        return auth.verify(authorization.split(" ", 1)[1].strip())
    except ValueError:
        return None


def require_user(authorization: Optional[str]) -> dict:
    u = current_user(authorization)
    if not u:
        raise HTTPException(401, "Кіру қажет")
    return u


@app.get("/api/config", tags=["Жүйе"])
def config():
    """Frontend үшін: қандай мүмкіндіктер қосулы."""
    return {"auth_enabled": auth.ENABLED, "firebase": auth.WEB_CONFIG if auth.ENABLED else None,
            # AUTH_REQUIRED=0 болса, кірмей-ақ сайтты қолдануға болады; әдепкіде кіру міндетті
            "auth_required": auth.ENABLED and os.environ.get("AUTH_REQUIRED", "1") != "0",
            # Телефонмен кіру Firebase Blaze жоспарын талап етеді; тек AUTH_PHONE=1 болса көрсетіледі
            "auth_phone": os.environ.get("AUTH_PHONE", "0") == "1",
            "ai_enabled": bool(ANTHROPIC_API_KEY), "telegram": telegram_bot.ENABLED}


@app.post("/api/auth/me", tags=["Тіркелу"])
def auth_me(authorization: Optional[str] = Header(None)):
    """Кіргеннен кейін шақырылады: жаңа қолданушыны тіркейді немесе соңғы кіру уақытын жаңартады."""
    u = require_user(authorization)
    t = now_iso()
    if db.one("SELECT id FROM users WHERE id = ?", (u["id"],)):
        db.execute("UPDATE users SET name = ?, email = ?, phone = ?, provider = ?, last_login = ? WHERE id = ?",
                   (u["name"], u["email"], u["phone"], u["provider"], t, u["id"]))
    else:
        db.execute("INSERT INTO users (id, name, email, phone, provider, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?, ?)",
                   (u["id"], u["name"], u["email"], u["phone"], u["provider"], t, t))
    return {"id": u["id"], "name": u["name"], "email": u["email"], "phone": u["phone"]}


class PlanBody(BaseModel):
    majors: list[str] = Field(default_factory=list, max_length=50)
    unis: list[str] = Field(default_factory=list, max_length=50)


@app.get("/api/plan", tags=["Тіркелу"])
def plan_get(authorization: Optional[str] = Header(None)):
    u = require_user(authorization)
    r = db.one("SELECT data FROM plans WHERE user_id = ?", (u["id"],))
    return json.loads(r["data"]) if r else {"majors": [], "unis": []}


@app.put("/api/plan", tags=["Тіркелу"])
def plan_put(body: PlanBody, authorization: Optional[str] = Header(None)):
    u = require_user(authorization)
    ok_m = {m["code"] for m in majors()}
    ok_u = {x["code"] for x in universities()}
    data = json.dumps({"majors": [c for c in body.majors if c in ok_m], "unis": [c for c in body.unis if c in ok_u]})
    if db.one("SELECT user_id FROM plans WHERE user_id = ?", (u["id"],)):
        db.execute("UPDATE plans SET data = ?, updated_at = ? WHERE user_id = ?", (data, now_iso(), u["id"]))
    else:
        db.execute("INSERT INTO plans (user_id, data, updated_at) VALUES (?, ?, ?)", (u["id"], data, now_iso()))
    return json.loads(data)


# --- Клуб ---

@app.get("/api/club", tags=["Клуб"])
def club_list(limit: int = Query(100, ge=1, le=500)):
    return db.query("SELECT id, topic, text, author, created_at FROM club_posts ORDER BY id DESC LIMIT ?", (limit,))


@app.post("/api/club", tags=["Клуб"], status_code=201)
def club_add(post: ClubPost, request: Request, authorization: Optional[str] = Header(None)):
    topic, text = post.topic.strip() or "Пікір", post.text.strip()
    if not text:
        raise HTTPException(422, "Мәтін бос")
    check_rate(client_ip(request))
    u = current_user(authorization)
    author = (u["name"] or "Тіркелген қолданушы") if u else None
    new_id = db.execute("INSERT INTO club_posts (topic, text, author, user_id, created_at) VALUES (?, ?, ?, ?, ?) RETURNING id",
                        (topic, text, author, u["id"] if u else None, now_iso()))
    return db.one("SELECT id, topic, text, author, created_at FROM club_posts WHERE id = ?", (new_id,))


# --- Әр университеттің пікірлері мен талқылауы ---

UNI_CODES = {u["code"] for u in load("universities")}


class UniPost(BaseModel):
    text: str = Field(..., min_length=1, max_length=1500)
    kind: str = Field("exp", pattern="^(plus|minus|q|exp)$")  # жақсы жағы / кемшілігі / сұрақ / тәжірибе
    role: str = Field("student", pattern="^(student|grad|applicant)$")  # студент / түлек / талапкер
    parent_id: Optional[int] = None


def _uni_rows(code: str) -> list[dict]:
    return db.query("SELECT id, parent_id, kind, role, text, author, user_id, created_at FROM uni_posts "
                    "WHERE uni_code = ? ORDER BY id DESC LIMIT 1000", (code,))


@app.get("/api/uni/{code}/posts", tags=["Пікірлер"])
def uni_posts(code: str, authorization: Optional[str] = Header(None)):
    """Университет туралы пікірлер (жаңасы жоғарыда) және оларға жауаптар (ескісі жоғарыда)."""
    if code not in UNI_CODES:
        raise HTTPException(404, "ЖОО табылмады")
    u = current_user(authorization)
    me = u["id"] if u else None
    rows = _uni_rows(code)
    out, replies = [], {}
    for r in rows:
        r["mine"] = bool(me and r["user_id"] == me)
        del r["user_id"]
        (replies.setdefault(r["parent_id"], []) if r["parent_id"] else out).append(r)
    for r in out:
        r["replies"] = sorted(replies.get(r["id"], []), key=lambda x: x["id"])
    counts = {k: sum(1 for r in out if r["kind"] == k) for k in ("plus", "minus", "q", "exp")}
    return {"posts": out, "counts": counts, "total": len(out)}


@app.post("/api/uni/{code}/posts", tags=["Пікірлер"], status_code=201)
def uni_post_add(code: str, post: UniPost, request: Request, authorization: Optional[str] = Header(None)):
    """Пікір немесе жауап жазу. Тек тіркелген қолданушы жаза алады."""
    if code not in UNI_CODES:
        raise HTTPException(404, "ЖОО табылмады")
    u = require_user(authorization)
    text = post.text.strip()
    if not text:
        raise HTTPException(422, "Мәтін бос")
    check_rate(client_ip(request), limit=20, bucket="uni")
    parent = None
    if post.parent_id:
        parent = db.one("SELECT id, parent_id FROM uni_posts WHERE id = ? AND uni_code = ?", (post.parent_id, code))
        if not parent:
            raise HTTPException(404, "Пікір табылмады")
        if parent["parent_id"]:  # жауапқа жауап — сол пікірдің астына
            parent = {"id": parent["parent_id"]}
    author = u["name"] or (u["email"] or "").split("@")[0] or "Қолданушы"
    db.execute("INSERT INTO uni_posts (uni_code, parent_id, kind, role, text, author, user_id, created_at) "
               "VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
               (code, parent["id"] if parent else None, "exp" if parent else post.kind, post.role, text, author, u["id"], now_iso()))
    return uni_posts(code, authorization)


@app.delete("/api/uni/{code}/posts/{pid}", tags=["Пікірлер"])
def uni_post_del(code: str, pid: int, authorization: Optional[str] = Header(None)):
    """Өз пікіріңді өшіру (жауаптарымен бірге)."""
    u = require_user(authorization)
    row = db.one("SELECT user_id FROM uni_posts WHERE id = ? AND uni_code = ?", (pid, code))
    if not row or row["user_id"] != u["id"]:
        raise HTTPException(403, "Тек өз пікіріңді өшіре аласың")
    db.execute("DELETE FROM uni_posts WHERE id = ? OR parent_id = ?", (pid, pid))
    return uni_posts(code, authorization)


# --- Аналитика (сыртқы қызметсіз, IP сақталмайды) ---

class TrackBody(BaseModel):
    kind: str = Field(..., pattern="^(page|search|ai)$")
    value: str = Field(..., min_length=1, max_length=120)
    lang: str = Field("kk", max_length=5)


@app.post("/api/track", tags=["Аналитика"], status_code=204)
def track(body: TrackBody, request: Request):
    check_rate(client_ip(request), limit=120, window=600, bucket="track")
    db.execute("INSERT INTO events (day, kind, value, lang) VALUES (?, ?, ?, ?)",
               (dt.date.today().isoformat(), body.kind, body.value.strip().lower()[:120], body.lang[:5]))
    return Response(status_code=204)


@app.get("/api/admin/stats", tags=["Аналитика"])
def admin_stats(key: str = "", days: int = Query(30, ge=1, le=365)):
    """Статистика: BZ_ADMIN_KEY орнатылғанда ғана, ?key=... арқылы."""
    if not ADMIN_KEY or not hashlib.sha256(key.encode()).digest() == hashlib.sha256(ADMIN_KEY.encode()).digest():
        raise HTTPException(403, "Рұқсат жоқ")
    since = (dt.date.today() - dt.timedelta(days=days - 1)).isoformat()
    top = lambda k: db.query("SELECT value, COUNT(*) AS n FROM events WHERE kind = ? AND day >= ? GROUP BY value ORDER BY n DESC LIMIT 30", (k, since))
    return {
        "days": days,
        "per_day": db.query("SELECT day, COUNT(*) AS n FROM events WHERE kind = 'page' AND day >= ? GROUP BY day ORDER BY day", (since,)),
        "pages": top("page"), "searches": top("search"), "ai_questions": top("ai"),
        "langs": db.query("SELECT lang, COUNT(*) AS n FROM events WHERE day >= ? GROUP BY lang ORDER BY n DESC", (since,)),
        "users": club_users(), "club_posts": club_count(),
    }


def club_users() -> int:
    r = db.one("SELECT COUNT(*) AS n FROM users")
    return int(r["n"]) if r else 0


# --- Telegram-бот ---

@app.post("/api/telegram/{secret}", include_in_schema=False)
async def telegram_webhook(secret: str, request: Request):
    if not telegram_bot.ENABLED or secret != telegram_bot.SECRET:
        raise HTTPException(404)
    upd = await request.json()
    msg = upd.get("message") or upd.get("edited_message") or {}
    chat = (msg.get("chat") or {}).get("id")
    if chat:
        telegram_bot.send(chat, telegram_bot.answer(msg.get("text", ""), majors(), universities(), is_creative))
    return {"ok": True}


# --- SEO: іздеу жүйелеріне арналған беттер ---

def _page(title: str, desc: str, body: str, app_link: str) -> HTMLResponse:
    e = htmlmod.escape
    canon = f'<link rel="canonical" href="{SITE_URL}{app_link}">' if SITE_URL else ""
    return HTMLResponse(f"""<!DOCTYPE html><html lang="kk"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)} · BilimIzde</title>
<meta name="description" content="{e(desc)}">{canon}
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:type" content="website">
<link rel="icon" href="/icon.svg"><link rel="manifest" href="/manifest.webmanifest">
<style>body{{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 18px;line-height:1.55;color:#1f2328}}a{{color:#b45309}}.btn{{display:inline-block;margin:18px 0;padding:12px 18px;border-radius:12px;background:#111;color:#fff;text-decoration:none}}li{{margin:3px 0}}</style>
</head><body><p><a href="/">BilimIzde</a></p>{body}<a class="btn" href="/#{app_link}">Сайтта толық ашу →</a></body></html>""")


@app.get("/u/{code}", include_in_schema=False)
def seo_uni(code: str):
    u = next((x for x in universities() if x["code"] == code), None)
    if not u:
        raise HTTPException(404)
    e = htmlmod.escape
    ex = uni_extra(code)
    mm = {m["code"]: m["name"] for m in majors()}
    progs = "".join(f"<li>{p} {e(mm.get(p, ''))}</li>" for p in ex.get("programs", []) if p in mm)
    body = (f"<h1>{e(u['name'])}</h1><p>{e(u['type'])}, {e(u['city'])}. ЖОО коды: {u['code']}.</p>"
            f"<p>Грант балдары: {e(u['grantScore'])}. Оқу ақысы: {e(u['tuition'])}.</p>"
            f"<p>Жатақхана: {'бар' if ex.get('dorm') else 'нақтылау керек'}. Әскери кафедра: {'бар' if ex.get('military') else 'жоқ'}.</p>"
            + (f"<h2>Мамандықтар</h2><ul>{progs}</ul>" if progs else ""))
    return _page(u["name"], f"{u['name']} ({u['city']}): ЖОО коды {u['code']}, грант балдары {u['grantScore']}, оқу ақысы, мамандықтар, жатақхана.", body, f"/uni/{code}")


@app.get("/m/{code}", include_in_schema=False)
def seo_major(code: str):
    m = next((x for x in majors() if x["code"].lower() == code.lower()), None)
    if not m:
        raise HTTPException(404)
    e = htmlmod.escape
    unis = offering_universities(m["code"])
    li = "".join(f"<li>{x['code']} {e(x['name'])}, {e(x['city'])}</li>" for x in unis)
    body = (f"<h1>{m['code']} {e(m['name'])}</h1><p>Шектік бал: {m['grantScore']}. ҰБТ пәндері: {e(m.get('combo') or '—')}.</p>"
            + (f"<h2>Оқытатын университеттер ({len(unis)})</h2><ul>{li}</ul>" if li else ""))
    return _page(f"{m['code']} {m['name']}", f"{m['code']} {m['name']}: шектік бал {m['grantScore']}, ҰБТ пәндері, грант саны және оқытатын {len(unis)} университет.", body, f"/major/{m['code']}")


@app.get("/sitemap.xml", include_in_schema=False)
def sitemap(request: Request):
    base = SITE_URL or str(request.base_url).rstrip("/")
    urls = [f"{base}/"] + [f"{base}/u/{u['code']}" for u in universities()] + [f"{base}/m/{m['code']}" for m in majors()]
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + \
          "".join(f"<url><loc>{u}</loc></url>\n" for u in urls) + "</urlset>\n"
    return Response(xml, media_type="application/xml")


@app.get("/robots.txt", include_in_schema=False)
def robots(request: Request):
    base = SITE_URL or str(request.base_url).rstrip("/")
    return PlainTextResponse(f"User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: {base}/sitemap.xml\n")


# Frontend (сайттың өзі) — API маршруттарынан кейін тіркеледі
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
