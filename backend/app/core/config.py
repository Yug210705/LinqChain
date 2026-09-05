"""Central environment + filesystem configuration for the Resilience OS backend."""
import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[2]        # backend/
APP_DIR = BACKEND_DIR / "app"                 # backend/app
LOG_DIR = BACKEND_DIR / "logs"
DATA_DIR = BACKEND_DIR / "data"
ENV_FILE = BACKEND_DIR / ".env"


def load_env() -> None:
    """Load backend/.env unless running in explicit offline (sqlite) mode."""
    if os.environ.get("RESILIENCE_SQLITE"):
        return
    for candidate in (Path.cwd() / ".env", ENV_FILE):
        if candidate.exists():
            load_dotenv(candidate, override=False)
            break


def sqlite_default() -> str:
    """Absolute sqlite URL for the offline dev database (backend/data/resilience.db)."""
    return "sqlite:///" + (DATA_DIR / "resilience.db").as_posix()