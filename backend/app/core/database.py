"""Database: a single SQLAlchemy engine + declarative Base for the whole API.

* SAP HANA Cloud is the source of truth when SAP_HANA_URL is configured in
  backend/.env (or in the process environment). HTTPS port 443 is supported
  via hdbcli through the `hana://` URL.
* Set RESILIENCE_SQLITE=1 to force offline/local mode — the engine then uses
  backend/data/resilience.db and never touches the cloud (used for dev while
  the HANA instance is stopped or hibernating).
"""
import os

from sqlalchemy import create_engine
from sqlalchemy import text as _text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core import config

config.load_env()

import urllib.parse

def _normalize_db_url(url: str) -> str:
    """Safely normalizes PostgreSQL URLs for SQLAlchemy and auto-encodes passwords."""
    if not url:
        return config.sqlite_default()
    url = url.strip('"\' ')
    if "[YOUR-PASSWORD]" in url or "<YOUR-PASSWORD>" in url:
        print("[database] Placeholder password detected in DATABASE_URL — falling back to local SQLite.")
        return config.sqlite_default()
    
    # Remove Prisma-specific pgbouncer flag that psycopg2 rejects
    url = url.replace("?pgbouncer=true&", "?").replace("&pgbouncer=true", "").replace("?pgbouncer=true", "")
    
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    
    # Auto-encode special characters like # and @ in password if unencoded
    if "postgresql" in url and "@" in url and "://" in url:
        try:
            prefix, rest = url.split("://", 1)
            if "@" in rest:
                user_pass, host_part = rest.rsplit("@", 1)
                if ":" in user_pass:
                    user, pwd = user_pass.split(":", 1)
                    encoded_pwd = urllib.parse.quote_plus(urllib.parse.unquote(pwd))
                    url = f"{prefix}://{user}:{encoded_pwd}@{host_part}"
        except Exception:
            pass
            
    if "supabase.com" in url and "sslmode=" not in url:
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}sslmode=require"
        
    return url

if os.environ.get("RESILIENCE_SQLITE") == "1":
    DATABASE_URL = config.sqlite_default()
elif os.environ.get("SUPABASE_DATABASE_URL"):
    DATABASE_URL = _normalize_db_url(os.environ.get("SUPABASE_DATABASE_URL"))
elif os.environ.get("DATABASE_URL") and not os.environ.get("RESILIENCE_SQLITE"):
    DATABASE_URL = _normalize_db_url(os.environ.get("DATABASE_URL"))
elif os.environ.get("SAP_HANA_URL"):
    DATABASE_URL = os.environ.get("SAP_HANA_URL")
else:
    DATABASE_URL = _normalize_db_url(os.environ.get("DATABASE_URL", config.sqlite_default()))

from sqlalchemy import event

if "sqlite" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False, "timeout": 15},
        pool_pre_ping=True,
    )

    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA busy_timeout=5000")
        cursor.close()
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_timeout=30,
        pool_recycle=1800,
        pool_pre_ping=True,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def warm_db() -> None:
    """Warm the connection pool at boot so the first request never pays
    HANA-cloud connect latency. HANA needs SELECT 1 FROM DUMMY."""
    try:
        with engine.connect() as c:
            c.execute(_text("SELECT 1 FROM DUMMY" if "hana" in str(engine.url) else "SELECT 1"))
    except Exception as exc:  # never fatal — requests will surface real errors
        print("[startup] DB warm-up failed:", exc)