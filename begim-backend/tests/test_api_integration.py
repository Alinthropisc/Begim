"""Интеграционные тесты HTTP API через Litestar TestClient на реальном MySQL.

Требуют поднятый MySQL `begim` (миграции + сидер) и Redis. Бот отключается
(пустой токен), чтобы тесты не ходили в Telegram. Помечены `integration`.
"""
import pytest

pytestmark = pytest.mark.integration


@pytest.fixture(scope="module")
def client():
    from litestar.testing import TestClient

    from app.config import settings
    import app.lifecycle as lc

    # Бот в тестах не нужен — пустой токен заставляет lifespan его пропустить.
    saved = settings.telegram_bot_token
    settings.telegram_bot_token = ""
    try:
        app = lc.create_app()
        with TestClient(app=app) as c:
            yield c
    finally:
        settings.telegram_bot_token = saved


class TestHealthMeta:
    def test_health(self, client):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_ping(self, client):
        r = client.get("/api/v1/ping")
        assert r.status_code == 200
        assert r.json() == {"pong": "begim"}

    def test_cities_has_kokand(self, client):
        r = client.get("/api/v1/cities")
        assert r.status_code == 200
        slugs = {c["slug"] for c in r.json()}
        assert "kokand" in slugs

    def test_categories_tree(self, client):
        r = client.get("/api/v1/categories")
        assert r.status_code == 200
        roots = r.json()
        assert len(roots) >= 1
        assert all("children" in node for node in roots)


class TestAuthGuards:
    def test_me_requires_auth(self, client):
        r = client.get("/api/v1/me")
        assert r.status_code in (401, 403)

    def test_seller_orders_requires_auth(self, client):
        r = client.get("/api/v1/seller/orders")
        assert r.status_code in (401, 403)
