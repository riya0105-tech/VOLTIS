import pytest
from app.config import Settings
from app.main import app
from fastapi.testclient import TestClient


def test_cors_default_origins():
    """Verify that default settings include localhost and production Vercel frontend."""
    s = Settings()
    origins = s.cors_origins_list
    assert "http://localhost:5173" in origins
    assert "http://localhost:3000" in origins
    assert "http://127.0.0.1:5173" in origins
    assert "https://voltis-olive.vercel.app" in origins


def test_cors_env_override_preserves_required_origins():
    """Verify that env var override preserves base origins while sanitizing input."""
    s = Settings(CORS_ORIGINS="https://voltis-olive.vercel.app")
    origins = s.cors_origins_list
    assert "http://localhost:5173" in origins
    assert "https://voltis-olive.vercel.app" in origins

    # Quoted string
    s_quoted = Settings(CORS_ORIGINS='"https://voltis-olive.vercel.app"')
    assert "https://voltis-olive.vercel.app" in s_quoted.cors_origins_list

    # Trailing slash
    s_slash = Settings(CORS_ORIGINS="https://voltis-olive.vercel.app/")
    assert "https://voltis-olive.vercel.app" in s_slash.cors_origins_list

    # JSON array string
    s_json = Settings(CORS_ORIGINS='["https://voltis-olive.vercel.app"]')
    assert "https://voltis-olive.vercel.app" in s_json.cors_origins_list


def test_cors_preflight_production_vercel():
    """Verify OPTIONS preflight request from production Vercel frontend succeeds with 200."""
    client = TestClient(app)
    response = client.options(
        "/api/machines",
        headers={
            "Origin": "https://voltis-olive.vercel.app",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://voltis-olive.vercel.app"
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_preflight_localhost():
    """Verify OPTIONS preflight request from localhost succeeds with 200."""
    client = TestClient(app)
    response = client.options(
        "/api/machines",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_get_production_vercel():
    """Verify GET request from production Vercel frontend returns CORS headers."""
    client = TestClient(app)
    response = client.get(
        "/health",
        headers={"Origin": "https://voltis-olive.vercel.app"},
    )
    assert response.headers.get("access-control-allow-origin") == "https://voltis-olive.vercel.app"
    assert response.headers.get("access-control-allow-credentials") == "true"
