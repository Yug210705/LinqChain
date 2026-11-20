"""Security test suite verifying authentication, token revocation, rate limiting, and input validation."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.rate_limiter import SlidingWindowRateLimiter
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    revoke_token,
    is_token_revoked,
)

client = TestClient(app)


def test_unauthenticated_request_rejected():
    """Verify that protected admin endpoints reject missing Authorization header with 401."""
    resp = client.get("/api/admin/auth/me")
    assert resp.status_code == 401
    assert "detail" in resp.json()


def test_malformed_token_rejected():
    """Verify that requests with invalid Bearer token signatures are rejected with 401."""
    resp = client.get("/api/admin/auth/me", headers={"Authorization": "Bearer invalid.token.payload"})
    assert resp.status_code == 401


def test_token_revocation_lifecycle():
    """Verify that revoking a token makes decode_token return None and prevents reuse."""
    payload = {"sub": "test-user-revocation", "role": "OWNER", "scope": "admin"}
    token = create_access_token(payload)
    
    # Token should initially decode properly
    decoded = decode_token(token)
    assert decoded is not None
    assert decoded["sub"] == "test-user-revocation"
    assert is_token_revoked(token) is False
    
    # Revoke the token
    revoke_token(token)
    assert is_token_revoked(token) is True
    
    # Decoding revoked token should now fail
    assert decode_token(token) is None


def test_sliding_window_rate_limiter_unit():
    """Verify the sliding window rate limiter correctly blocks after exceeding threshold."""
    limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=10)
    client_ip = "192.168.1.100"
    
    # First 3 requests must be allowed
    assert limiter.is_allowed(client_ip)[0] is True
    assert limiter.is_allowed(client_ip)[0] is True
    assert limiter.is_allowed(client_ip)[0] is True
    
    # 4th request must be rejected with retry_after > 0
    allowed, retry_after = limiter.is_allowed(client_ip)
    assert allowed is False
    assert retry_after > 0
    
    # Another IP should not be affected
    assert limiter.is_allowed("192.168.1.101")[0] is True


def test_large_payload_rejected_by_middleware():
    """Verify that requests exceeding MAX_REQUEST_BODY_BYTES receive 413 Payload Too Large."""
    # Send a header claiming 15MB content-length
    resp = client.post(
        "/api/admin/auth/login",
        headers={"Content-Length": str(15 * 1024 * 1024)},
        content=b"test",
    )
    assert resp.status_code == 413
    data = resp.json()
    assert data["error"]["code"] == "PAYLOAD_TOO_LARGE"


def test_cors_configured():
    """Verify CORS preflight returns configured allowed origin headers."""
    resp = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert resp.headers.get("access-control-allow-origin") == "http://localhost:3000"
