"""Automated verification for health and readiness probes and security headers."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_liveness_probe():
    """Verify that /health responds immediately with 200 and valid status payload."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "linqchain-api"
    assert "version" in data
    assert "uptime_seconds" in data
    assert "environment" in data


def test_ready_readiness_probe():
    """Verify that /ready probes all underlying database connectivity."""
    response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["ready"] is True
    assert data["database"] == "connected"
    assert data["admin_database"] == "connected"


def test_security_headers_injected():
    """Verify that enterprise security headers and request-id are present on responses."""
    response = client.get("/health")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "X-Request-ID" in response.headers
