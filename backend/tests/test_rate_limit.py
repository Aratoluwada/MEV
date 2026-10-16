from app.core.rate_limit import InMemoryRateLimiter
from app.main import app
from fastapi.testclient import TestClient


def test_sliding_window_rate_limit_resets_after_window() -> None:
    now = [0.0]
    limiter = InMemoryRateLimiter(max_requests=2, window_seconds=10, clock=lambda: now[0])

    assert limiter.allow("client-a") is True
    assert limiter.allow("client-a") is True
    assert limiter.allow("client-a") is False
    assert limiter.allow("client-b") is True

    now[0] = 10.0
    assert limiter.allow("client-a") is True


def test_api_middleware_returns_429_after_limit(monkeypatch) -> None:
    import app.main as main_module

    monkeypatch.setattr(main_module, "rate_limiter", InMemoryRateLimiter(max_requests=1, window_seconds=30))
    client = TestClient(app)

    first = client.post("/api/v1/check", json={})
    second = client.post("/api/v1/check", json={})

    assert first.status_code == 200
    assert second.status_code == 429
    assert second.headers["retry-after"] == "30"
