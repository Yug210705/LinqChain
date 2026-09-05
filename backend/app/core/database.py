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

if os.environ.get("RESILIENCE_SQLITE"):
    DATABASE_URL = os.environ.get("DATABASE_URL", config.sqlite_default())
else:
    DATABASE_URL = os.environ.get("SAP_HANA_URL", os.environ.get("DATABASE_URL", config.sqlite_default()))

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
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