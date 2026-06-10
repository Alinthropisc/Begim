"""Юнит-тесты security-слоя: initData (HMAC), JWT, phone-hash. Без I/O."""
import hashlib
import hmac
import json
from urllib.parse import urlencode

import pytest

from services.security.initdata import (
    InitDataExpired,
    InitDataInvalidHash,
    InitDataMalformed,
    validate_init_data,
)
from services.security.jwt import TokenError, decode_token, issue_token
from services.security.phone import hash_phone, normalize_e164

BOT_TOKEN = "123456:TEST-BOT-TOKEN"


def _build_init_data(token: str, *, auth_date: int, user: dict | None = None, extra: dict | None = None) -> str:
    """Собрать валидную initData-строку по спеке Telegram."""
    user = user or {"id": 777, "first_name": "Begim", "username": "begim_user"}
    params: dict[str, str] = {
        "auth_date": str(auth_date),
        "query_id": "AAH_test",
        "user": json.dumps(user, separators=(",", ":")),
    }
    if extra:
        params.update(extra)
    data_check_string = "\n".join(f"{k}={params[k]}" for k in sorted(params))
    secret_key = hmac.new(b"WebAppData", token.encode(), hashlib.sha256).digest()
    params["hash"] = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return urlencode(params)


# ---------- initData ----------

class TestInitData:
    def test_valid(self):
        now = 1_700_000_000
        raw = _build_init_data(BOT_TOKEN, auth_date=now)
        parsed = validate_init_data(raw, BOT_TOKEN, max_age_sec=3600, clock=now + 10)
        assert parsed.tg_id == 777
        assert parsed.user["username"] == "begim_user"
        assert parsed.auth_date == now

    def test_invalid_hash(self):
        now = 1_700_000_000
        raw = _build_init_data(BOT_TOKEN, auth_date=now)
        with pytest.raises(InitDataInvalidHash):
            validate_init_data(raw, "WRONG-TOKEN", clock=now + 10)

    def test_tampered_payload_fails_hash(self):
        now = 1_700_000_000
        raw = _build_init_data(BOT_TOKEN, auth_date=now)
        tampered = raw.replace("777", "999")
        with pytest.raises(InitDataInvalidHash):
            validate_init_data(tampered, BOT_TOKEN, clock=now + 10)

    def test_expired(self):
        now = 1_700_000_000
        raw = _build_init_data(BOT_TOKEN, auth_date=now)
        with pytest.raises(InitDataExpired):
            validate_init_data(raw, BOT_TOKEN, max_age_sec=60, clock=now + 3600)

    def test_missing_hash(self):
        raw = urlencode({"auth_date": "1700000000", "user": json.dumps({"id": 1})})
        with pytest.raises(InitDataMalformed):
            validate_init_data(raw, BOT_TOKEN)

    def test_empty(self):
        with pytest.raises(InitDataMalformed):
            validate_init_data("", BOT_TOKEN)

    def test_start_param_extracted(self):
        now = 1_700_000_000
        raw = _build_init_data(BOT_TOKEN, auth_date=now, extra={"start_param": "s_kokand-cakes"})
        parsed = validate_init_data(raw, BOT_TOKEN, clock=now + 5)
        assert parsed.start_param == "s_kokand-cakes"


# ---------- JWT ----------

class TestJwt:
    def test_issue_and_decode_access(self):
        token, payload = issue_token(42, "access")
        decoded = decode_token(token, expected_kind="access")
        assert decoded.user_id == 42
        assert decoded.kind == "access"
        assert decoded.jti == payload.jti

    def test_refresh_kind(self):
        token, _ = issue_token(42, "refresh")
        decoded = decode_token(token, expected_kind="refresh")
        assert decoded.kind == "refresh"

    def test_wrong_kind_rejected(self):
        token, _ = issue_token(42, "access")
        with pytest.raises(TokenError):
            decode_token(token, expected_kind="refresh")

    def test_expired_rejected(self):
        token, _ = issue_token(42, "access", ttl_sec=-1)
        with pytest.raises(TokenError):
            decode_token(token)

    def test_tampered_rejected(self):
        token, _ = issue_token(42, "access")
        with pytest.raises(TokenError):
            decode_token(token + "x")

    def test_unique_jti(self):
        _, p1 = issue_token(1, "access")
        _, p2 = issue_token(1, "access")
        assert p1.jti != p2.jti

    def test_extra_claims_roundtrip(self):
        token, _ = issue_token(7, "access", extra={"role": "seller"})
        decoded = decode_token(token)
        assert decoded.extra.get("role") == "seller"


# ---------- phone ----------

class TestPhone:
    @pytest.mark.parametrize("raw,expected", [
        ("+998901234567", "+998901234567"),
        ("998901234567", "+998901234567"),
        ("901234567", "+998901234567"),
        ("90 123 45 67", "+998901234567"),
        ("00998901234567", "+998901234567"),
        ("+998 (90) 123-45-67", "+998901234567"),
    ])
    def test_normalize_ok(self, raw, expected):
        assert normalize_e164(raw) == expected

    @pytest.mark.parametrize("raw", ["", "   ", "abc", "12345"])
    def test_normalize_bad(self, raw):
        assert normalize_e164(raw) is None

    def test_hash_deterministic(self):
        assert hash_phone("901234567") == hash_phone("+998901234567")

    def test_hash_distinct_numbers(self):
        assert hash_phone("901234567") != hash_phone("901234568")

    def test_hash_is_sha256_hex(self):
        h = hash_phone("901234567")
        assert h is not None and len(h) == 64
        int(h, 16)  # hex-parsable

    def test_hash_none_for_bad(self):
        assert hash_phone("nope") is None
