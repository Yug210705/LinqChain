"""Central environment + filesystem configuration for the LinqChain backend."""
import os
from pathlib import Path
from typing import List, Optional
from dotenv import load_dotenv
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]        # backend/
APP_DIR = BACKEND_DIR / "app"                            # backend/app
LOG_DIR = BACKEND_DIR / "logs"
DATA_DIR = BACKEND_DIR / "data"
ENV_FILE = BACKEND_DIR / ".env"

LOG_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_env() -> None:
    """Load backend/.env configuration into os.environ."""
    for candidate in (Path.cwd() / ".env", ENV_FILE):
        if candidate.exists():
            load_dotenv(candidate, override=False)
            break


def sqlite_default() -> str:
    """Absolute sqlite URL for the offline dev database (backend/data/resilience.db)."""
    return "sqlite:///" + (DATA_DIR / "resilience.db").as_posix()


def admin_sqlite_default() -> str:
    """Absolute sqlite URL for the admin database (backend/data/admin.db)."""
    return "sqlite:///" + (DATA_DIR / "admin.db").as_posix()


load_env()


class Settings(BaseSettings):
    """Production-hardened settings schema with fail-fast startup validation."""
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ENVIRONMENT: str = Field(default="development", description="Runtime environment: development | staging | production | test")
    LOG_LEVEL: str = Field(default="INFO", description="Standard logging level")

    SECRET_KEY: str = Field(
        default="linqchain-platform-secret-key-2026-production-min32chars",
        description="General application secret key",
    )
    ADMIN_JWT_SECRET: str = Field(
        default="linqchain-enterprise-admin-jwt-secret-key-2026-min32chars",
        description="HMAC secret for signing Admin and Platform JWTs",
    )
    ADMIN_JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=30)

    # CORS & Webhook security
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,https://linqchaindev.vercel.app,https://linqchain.vercel.app",
        description="Comma-separated list of allowed CORS origins",
    )
    SAP_WEBHOOK_SECRET: str = Field(
        default="linqchain-sap-eventmesh-shared-secret-key",
        description="Shared secret for inbound SAP Event Mesh webhooks",
    )

    # Database configuration
    RESILIENCE_SQLITE: str = Field(default="1")
    DATABASE_URL: Optional[str] = None
    SUPABASE_DATABASE_URL: Optional[str] = None
    SAP_HANA_URL: Optional[str] = None
    ADMIN_DATABASE_URL: Optional[str] = None

    # External APIs
    OPENROUTER_API_KEY: Optional[str] = None

    # Abuse protection / Rate limiting
    RATE_LIMIT_LOGIN_PER_MINUTE: int = Field(default=10)
    RATE_LIMIT_API_PER_MINUTE: int = Field(default=180)
    MAX_REQUEST_BODY_BYTES: int = Field(default=10 * 1024 * 1024)  # 10 MB

    @field_validator("ENVIRONMENT")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        valid_envs = {"development", "staging", "production", "test"}
        normalized = v.strip().lower()
        if normalized not in valid_envs:
            raise ValueError(f"ENVIRONMENT must be one of {valid_envs}, got '{v}'")
        return normalized

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_test(self) -> bool:
        return self.ENVIRONMENT == "test"

    @property
    def allowed_origins_list(self) -> List[str]:
        base_origins = {
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "https://linqchaindev.vercel.app",
            "https://linqchain.vercel.app",
        }
        for o in self.ALLOWED_ORIGINS.split(","):
            if o.strip():
                base_origins.add(o.strip())
        return list(base_origins)

    def validate_production_readiness(self) -> None:
        """Enforces that production environments do not use default or weak secrets."""
        if self.is_production:
            if "min32chars" in self.ADMIN_JWT_SECRET or len(self.ADMIN_JWT_SECRET) < 32:
                raise ValueError("PRODUCTION SECURITY ERROR: ADMIN_JWT_SECRET must be at least 32 characters and set via environment.")
            if "min32chars" in self.SECRET_KEY or len(self.SECRET_KEY) < 32:
                raise ValueError("PRODUCTION SECURITY ERROR: SECRET_KEY must be at least 32 characters and set via environment.")


# Global instantiated settings
settings = Settings()