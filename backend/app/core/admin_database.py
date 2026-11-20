"""Admin database: dedicated SQLite engine and session for admin panel operations."""
import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from app.core.config import DATA_DIR

import urllib.parse

ADMIN_DB_PATH = DATA_DIR / "admin.db"
raw_admin_url = os.environ.get("ADMIN_DATABASE_URL", "sqlite:///" + ADMIN_DB_PATH.as_posix())

def _normalize_admin_url(url: str) -> str:
    if not url:
        return "sqlite:///" + ADMIN_DB_PATH.as_posix()
    url = url.strip('"\' ')
    if "[YOUR-PASSWORD]" in url or "<YOUR-PASSWORD>" in url:
        return "sqlite:///" + ADMIN_DB_PATH.as_posix()
    url = url.replace("?pgbouncer=true&", "?").replace("&pgbouncer=true", "").replace("?pgbouncer=true", "")
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
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

from sqlalchemy import event

ADMIN_DATABASE_URL = _normalize_admin_url(raw_admin_url)

if "sqlite" in ADMIN_DATABASE_URL:
    admin_engine = create_engine(
        ADMIN_DATABASE_URL,
        connect_args={"check_same_thread": False, "timeout": 15},
        pool_pre_ping=True,
    )

    @event.listens_for(admin_engine, "connect")
    def _set_admin_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA busy_timeout=5000")
        cursor.close()
else:
    admin_engine = create_engine(
        ADMIN_DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_timeout=30,
        pool_recycle=1800,
        pool_pre_ping=True,
    )

AdminSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=admin_engine)
AdminBase = declarative_base()


def get_admin_db() -> Generator[Session, None, None]:
    """Generator function for FastAPI Depends() yielding an admin database session."""
    db = AdminSessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_admin_db() -> None:
    """Initialize all admin database tables."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    # Ensure all admin ORM models are registered on AdminBase before create_all
    import app.models.admin_models  # noqa: F401
    AdminBase.metadata.create_all(bind=admin_engine)
