"""Дерекқор қабаты.

DATABASE_URL орнатылса (мысалы Render PostgreSQL), PostgreSQL қолданылады — деректер сервер қайта қосылғанда өшпейді.
Әйтпесе жергілікті SQLite файлы (BZ_DB_PATH, әдепкі backend/bilimizde.db).
SQL сұраныстарында орын белгісі ретінде `?` жазылады, PostgreSQL үшін ол `%s`-ке автоматты ауыстырылады.
"""
from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql://" + DATABASE_URL[len("postgres://"):]
IS_PG = DATABASE_URL.startswith("postgresql://")
DB_PATH = Path(os.environ.get("BZ_DB_PATH", Path(__file__).resolve().parent.parent / "bilimizde.db"))

SCHEMA = [
    """CREATE TABLE IF NOT EXISTS club_posts (
        id {pk},
        topic TEXT NOT NULL,
        text TEXT NOT NULL,
        author TEXT,
        user_id TEXT,
        created_at TEXT NOT NULL
    )""",
    """CREATE TABLE IF NOT EXISTS uni_posts (
        id {pk},
        uni_code TEXT NOT NULL,
        parent_id INTEGER,
        kind TEXT NOT NULL,
        role TEXT NOT NULL,
        text TEXT NOT NULL,
        author TEXT,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL
    )""",
    """CREATE INDEX IF NOT EXISTS uni_posts_code ON uni_posts (uni_code)""",
    """CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        provider TEXT,
        created_at TEXT NOT NULL,
        last_login TEXT NOT NULL
    )""",
    """CREATE TABLE IF NOT EXISTS plans (
        user_id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )""",
    """CREATE TABLE IF NOT EXISTS events (
        id {pk},
        day TEXT NOT NULL,
        kind TEXT NOT NULL,
        value TEXT NOT NULL,
        lang TEXT
    )""",
    "CREATE INDEX IF NOT EXISTS events_day ON events (day)",
]


def _sql(q: str) -> str:
    return q.replace("?", "%s") if IS_PG else q


@contextmanager
def connect():
    if IS_PG:
        import psycopg  # requirements.txt ішінде
        from psycopg.rows import dict_row
        con = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    else:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        con = sqlite3.connect(DB_PATH)
        con.row_factory = sqlite3.Row
    try:
        yield con
        con.commit()
    finally:
        con.close()


def query(q: str, params: tuple = ()) -> list[dict]:
    with connect() as con:
        cur = con.execute(_sql(q), params)
        return [dict(r) for r in cur.fetchall()]


def one(q: str, params: tuple = ()):
    rows = query(q, params)
    return rows[0] if rows else None


def execute(q: str, params: tuple = ()) -> int | None:
    """INSERT/UPDATE орындайды. INSERT ... RETURNING id болса, id қайтарады."""
    with connect() as con:
        cur = con.execute(_sql(q), params)
        if q.strip().upper().startswith("INSERT") and "RETURNING" in q.upper():
            row = cur.fetchone()
            return (row["id"] if isinstance(row, dict) else row[0]) if row else None
        return None


def init() -> None:
    pk = "SERIAL PRIMARY KEY" if IS_PG else "INTEGER PRIMARY KEY AUTOINCREMENT"
    with connect() as con:
        for stmt in SCHEMA:
            con.execute(stmt.format(pk=pk))
        # Ескі SQLite базасына жаңа бағандарды қосу
        if not IS_PG:
            cols = {r[1] for r in con.execute("PRAGMA table_info(club_posts)").fetchall()}
            for c in ("author", "user_id"):
                if c not in cols:
                    con.execute(f"ALTER TABLE club_posts ADD COLUMN {c} TEXT")
