"""Юнит-тесты платёжных провайдеров: checkout-URL и подписи. Без БД."""
import base64
import hashlib
from types import SimpleNamespace

import pytest

from services.payments.click import ClickProvider
from services.payments.payme import PaymeProvider, _jsonrpc_error, _jsonrpc_ok


def _order(oid=55, total=1_000_00):
    return SimpleNamespace(id=oid, total_minor=total)


def _payment(amount=1_000_00):
    return SimpleNamespace(amount_minor=amount, id=1)


# ---------- Payme ----------

class TestPayme:
    @pytest.mark.asyncio
    async def test_checkout_url_encodes_merchant_order_amount(self):
        p = PaymeProvider(merchant_id="MID", secret_key="SK", endpoint="https://checkout.paycom.uz")
        link = await p.create_checkout(_order(oid=7), _payment(amount=250_00))
        assert link.url.startswith("https://checkout.paycom.uz/")
        b64 = link.url.rsplit("/", 1)[-1]
        decoded = base64.b64decode(b64).decode()
        assert decoded == "m=MID;ac.order_id=7;a=25000"

    @pytest.mark.asyncio
    async def test_checkout_requires_merchant(self):
        p = PaymeProvider(merchant_id="", secret_key="SK")
        with pytest.raises(RuntimeError):
            await p.create_checkout(_order(), _payment())

    @pytest.mark.asyncio
    async def test_verify_webhook_basic_auth_ok(self):
        p = PaymeProvider(merchant_id="MID", secret_key="topsecret")
        cred = base64.b64encode(b"Paycom:topsecret").decode()
        assert await p.verify_webhook({"authorization": f"Basic {cred}"}, b"") is True

    @pytest.mark.asyncio
    async def test_verify_webhook_wrong_password(self):
        p = PaymeProvider(merchant_id="MID", secret_key="topsecret")
        cred = base64.b64encode(b"Paycom:wrong").decode()
        assert await p.verify_webhook({"authorization": f"Basic {cred}"}, b"") is False

    @pytest.mark.asyncio
    async def test_verify_webhook_missing_header(self):
        p = PaymeProvider(merchant_id="MID", secret_key="topsecret")
        assert await p.verify_webhook({}, b"") is False

    @pytest.mark.asyncio
    async def test_verify_webhook_no_secret_configured(self):
        p = PaymeProvider(merchant_id="MID", secret_key="")
        cred = base64.b64encode(b"Paycom:x").decode()
        assert await p.verify_webhook({"authorization": f"Basic {cred}"}, b"") is False

    @pytest.mark.asyncio
    async def test_unknown_method_returns_method_not_found(self):
        p = PaymeProvider(merchant_id="MID", secret_key="SK")
        out = await p.handle_webhook({"method": "Nope", "id": 1, "params": {}})
        assert out.response_body["error"]["code"] == -32601

    def test_jsonrpc_ok_shape(self):
        assert _jsonrpc_ok(9, {"allow": True}) == {"jsonrpc": "2.0", "id": 9, "result": {"allow": True}}

    def test_jsonrpc_error_shape(self):
        err = _jsonrpc_error(9, -31001, "wrong amount")
        assert err["error"]["code"] == -31001


# ---------- Click ----------

class TestClick:
    @pytest.mark.asyncio
    async def test_checkout_url_converts_tiyin_to_sums(self):
        c = ClickProvider(merchant_id="M", service_id="S", secret_key="K")
        link = await c.create_checkout(_order(oid=12), _payment(amount=500_00))  # 50000 тийин
        assert "service_id=S" in link.url
        assert "merchant_id=M" in link.url
        assert "amount=500" in link.url          # 50000 // 100 = 500 сум
        assert "transaction_param=12" in link.url

    @pytest.mark.asyncio
    async def test_checkout_requires_ids(self):
        c = ClickProvider(merchant_id="", service_id="", secret_key="K")
        with pytest.raises(RuntimeError):
            await c.create_checkout(_order(), _payment())

    def _prepare_payload(self, secret="K"):
        p = {
            "click_trans_id": "111",
            "service_id": "S",
            "merchant_trans_id": "55",
            "amount": "1000.00",
            "action": "0",
            "sign_time": "2026-01-01 00:00:00",
        }
        raw = f"{p['click_trans_id']}{p['service_id']}{secret}{p['merchant_trans_id']}{p['amount']}{p['action']}{p['sign_time']}"
        p["sign_string"] = hashlib.md5(raw.encode()).hexdigest()
        return p

    def test_prepare_sign_valid(self):
        c = ClickProvider(merchant_id="M", service_id="S", secret_key="K")
        assert c._verify_prepare_sign(self._prepare_payload()) is True

    def test_prepare_sign_tampered(self):
        c = ClickProvider(merchant_id="M", service_id="S", secret_key="K")
        p = self._prepare_payload()
        p["amount"] = "9999.00"  # подменили сумму после подписи
        assert c._verify_prepare_sign(p) is False

    def test_prepare_sign_wrong_secret(self):
        c = ClickProvider(merchant_id="M", service_id="S", secret_key="OTHER")
        assert c._verify_prepare_sign(self._prepare_payload(secret="K")) is False

    @pytest.mark.asyncio
    async def test_unknown_action_ignored(self):
        c = ClickProvider(merchant_id="M", service_id="S", secret_key="K")
        out = await c.handle_webhook({"action": "9"})
        assert out.event == "ignored"
        assert out.response_body["error"] == -3  # ERR_ACTION_NOT_FOUND
