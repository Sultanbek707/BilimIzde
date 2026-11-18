"""Firebase арқылы тіркелу (Google немесе телефон нөмірі).

Қосу үшін Render-де екі айнымалы орнату жеткілікті:
  FIREBASE_PROJECT_ID  — Firebase жобасының ID-і (мысалы bilimizde-12345)
  FIREBASE_WEB_CONFIG  — Firebase консоліндегі веб-қосымша конфигі (JSON бір жолмен)
Frontend Firebase-тен ID token алады, сервер оны Google-дың ашық кілттерімен тексереді.
"""
from __future__ import annotations

import json
import os
import time
import urllib.request

import jwt  # PyJWT[crypto]

PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID", "").strip()
_raw_cfg = os.environ.get("FIREBASE_WEB_CONFIG", "").strip()
try:
    WEB_CONFIG = json.loads(_raw_cfg) if _raw_cfg else None
except ValueError:
    WEB_CONFIG = None
ENABLED = bool(PROJECT_ID and WEB_CONFIG)

CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
_certs: dict = {"exp": 0, "keys": {}}


def _keys() -> dict:
    if time.time() < _certs["exp"]:
        return _certs["keys"]
    with urllib.request.urlopen(CERTS_URL, timeout=10) as r:
        keys = json.load(r)
        cc = r.headers.get("Cache-Control", "")
    max_age = 3600
    for part in cc.split(","):
        if part.strip().startswith("max-age="):
            max_age = int(part.split("=")[1])
    _certs.update(exp=time.time() + max_age, keys=keys)
    return keys


def verify(id_token: str) -> dict:
    """Firebase ID token-ді тексереді. Қате болса ValueError шығарады."""
    if not ENABLED:
        raise ValueError("Тіркелу қосылмаған")
    try:
        kid = jwt.get_unverified_header(id_token).get("kid")
        cert = _keys().get(kid)
        if not cert:
            raise ValueError("Белгісіз кілт")
        from cryptography.x509 import load_pem_x509_certificate
        pub = load_pem_x509_certificate(cert.encode()).public_key()
        claims = jwt.decode(
            id_token, pub, algorithms=["RS256"], audience=PROJECT_ID,
            issuer=f"https://securetoken.google.com/{PROJECT_ID}", leeway=60,
        )
    except jwt.PyJWTError as e:
        raise ValueError(f"Token жарамсыз: {e}") from e
    if not claims.get("sub"):
        raise ValueError("Token-де қолданушы жоқ")
    return {
        "id": claims["sub"],
        "name": claims.get("name") or "",
        "email": claims.get("email") or "",
        "phone": claims.get("phone_number") or "",
        "provider": (claims.get("firebase") or {}).get("sign_in_provider", ""),
    }
