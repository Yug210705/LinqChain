"""Security utilities for password hashing and JWT token management."""
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Set
import bcrypt
from jose import jwt, JWTError

from app.core.config import settings

ADMIN_JWT_SECRET = settings.ADMIN_JWT_SECRET
ADMIN_JWT_ALGORITHM = settings.ADMIN_JWT_ALGORITHM
ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
ADMIN_ACCESS_TOKEN_EXPIRE_SECONDS = ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES * 60
ADMIN_REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS

# In-memory revocation blocklist (persisted across runtime requests)
_REVOKED_TOKENS: Set[str] = set()


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain.encode("utf-8")[:72], hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token with unique jti (token ID)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta is not None else timedelta(minutes=ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": str(uuid.uuid4()),
        "type": "access",
    })
    return jwt.encode(to_encode, ADMIN_JWT_SECRET, algorithm=ADMIN_JWT_ALGORITHM)


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create a signed JWT refresh token with unique jti (token ID)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ADMIN_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": str(uuid.uuid4()),
        "type": "refresh",
    })
    return jwt.encode(to_encode, ADMIN_JWT_SECRET, algorithm=ADMIN_JWT_ALGORITHM)


def revoke_token(token: str) -> bool:
    """Revoke a token by adding its jti (or raw token) to the revocation list."""
    try:
        payload = jwt.decode(token, ADMIN_JWT_SECRET, algorithms=[ADMIN_JWT_ALGORITHM], options={"verify_exp": False})
        jti = payload.get("jti")
        if jti:
            _REVOKED_TOKENS.add(jti)
        _REVOKED_TOKENS.add(token)
        return True
    except Exception:
        _REVOKED_TOKENS.add(token)
        return True


def is_token_revoked(token: str, payload: Optional[Dict[str, Any]] = None) -> bool:
    """Check if token or its jti is in the revocation list."""
    if token in _REVOKED_TOKENS:
        return True
    if payload and payload.get("jti") in _REVOKED_TOKENS:
        return True
    return False


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT token, verifying signature, expiration, and revocation."""
    if is_token_revoked(token):
        return None
    try:
        payload = jwt.decode(token, ADMIN_JWT_SECRET, algorithms=[ADMIN_JWT_ALGORITHM])
        if is_token_revoked(token, payload):
            return None
        return payload
    except JWTError:
        return None

