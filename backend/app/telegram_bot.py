"""BilimIzde Telegram-боты (webhook арқылы).

Қосу:
  1. Telegram-да @BotFather арқылы бот ашып, token ал.
  2. Render-де айнымалыларды орнат:
       TELEGRAM_BOT_TOKEN       — @BotFather берген token
       TELEGRAM_WEBHOOK_SECRET  — кез келген ұзын құпия сөз (мысалы 32 әріп)
  3. Браузерде бір рет аш (webhook орнату):
       https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<сайт>/api/telegram/<SECRET>
Бот түсінетіні: мамандық шифры (B057), ЖОО коды (029), қала атауы, «110 балл», /start.
"""
from __future__ import annotations

import json
import os
import re
import urllib.request

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
SECRET = os.environ.get("TELEGRAM_WEBHOOK_SECRET", "").strip()
ENABLED = bool(TOKEN and SECRET)
SITE = os.environ.get("BZ_SITE_URL", "").rstrip("/")

HELP = (
    "Сәлем! Мен BilimIzde ботымын 🎓\n\n"
    "Маған жаз:\n"
    "• мамандық шифры — B057\n"
    "• ЖОО коды — 029\n"
    "• қала — Алматы\n"
    "• ҰБТ балың — 110 балл\n"
    "• мамандық атауы — информатика"
)


def send(chat_id: int, text: str) -> None:
    body = json.dumps({"chat_id": chat_id, "text": text[:4000], "disable_web_page_preview": True}).encode()
    req = urllib.request.Request(f"https://api.telegram.org/bot{TOKEN}/sendMessage", data=body,
                                 headers={"Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req, timeout=10).read()
    except Exception:
        pass


def answer(text: str, majors: list[dict], unis: list[dict], creative) -> str:
    t = (text or "").strip()
    low = t.lower()
    link = (lambda p: f"\n{SITE}/#/{p}") if SITE else (lambda p: "")
    if not t or low.startswith("/start") or low.startswith("/help"):
        return HELP
    m = re.search(r"\b(bm?\d{3})\b", low)
    if m:
        code = m.group(1).upper()
        mj = next((x for x in majors if x["code"] == code), None)
        if not mj:
            return f"{code} шифрлы мамандық табылмады."
        return (f"{mj['code']} — {mj['name']}\nШектік бал: {mj['grantScore']}\n"
                f"ҰБТ пәндері: {mj.get('combo') or '—'}" + link(f"major/{code}"))
    m = re.search(r"\b(\d{2,3})\s*(балл|бал|ball|балла|баллов)\b", low)
    if m:
        sc = int(m.group(1))
        if not 0 <= sc <= 140:
            return "Балл 0 мен 140 аралығында болуы керек."
        ok = [x for x in majors if not creative(x) and sc >= int(x["grantScore"])]
        return (f"{sc} балмен шектік балға жететін мамандықтар: {len(ok)}.\n"
                + "\n".join(f"• {x['code']} {x['name']}" for x in ok[:15])
                + (f"\n…және тағы {len(ok) - 15}" if len(ok) > 15 else "") + link("calc"))
    m = re.fullmatch(r"\d{3}", t)
    if m:
        u = next((x for x in unis if x["code"] == t), None)
        if u:
            return (f"{u['code']} — {u['name']}\n{u['city']}, {u['type']}\nГрант балдары: {u['grantScore']}\n"
                    f"Оқу ақысы: {u['tuition']}" + link(f"uni/{u['code']}"))
    city = [u for u in unis if u["city"].lower() == low]
    if city:
        return f"{city[0]['city']}: {len(city)} ЖОО\n" + "\n".join(f"• {u['code']} {u['name']}" for u in city[:25])
    found = [x for x in majors if low in x["name"].lower()][:10]
    if found:
        return "Табылған мамандықтар:\n" + "\n".join(f"• {x['code']} {x['name']} (шек {x['grantScore']})" for x in found)
    found = [u for u in unis if low in u["name"].lower()][:10]
    if found:
        return "Табылған ЖОО:\n" + "\n".join(f"• {u['code']} {u['name']}, {u['city']}" for u in found)
    return "Түсінбедім 🙂\n\n" + HELP
