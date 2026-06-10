"""Telegram Mini App initData валидация.

Алгоритм по спеке (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app):

    data_check_string = '\n'.join(f'{k}={v}' for k, v in sorted(params if k != 'hash'))
    secret_key = HMAC_SHA256(b"WebAppData", bot_token)
    valid = hmac_sha256(secret_key, data_check_string) == hash_from_params

Дополнительно валидируем `auth_date` (не старше `max_age_sec`) — защита от
replay-атак с захваченным initData.

Парсим `user` — это JSON-строка с полями TG-юзера. Возвращаем уже распакованный dict.

Этот модуль — **чистая функция без I/O**, легко тестируется юнитами.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from typing import Any
from urllib.parse import parse_qsl


class InitDataError(Exception):
    """Базовое исключение валидации initData."""


class InitDataInvalidHash(InitDataError):
    """HMAC не совпал — данные подделаны или bot_token неверный."""


class InitDataExpired(InitDataError):
    """auth_date старше max_age_sec."""


class InitDataMalformed(InitDataError):
    """Структура initData повреждена (нет hash, user не JSON и т.д.)."""


@dataclass(slots=True, frozen=True)
class TelegramInitData:
    """Распарсенные и провалидированные данные Telegram Mini App."""

    user: dict[str, Any]            # {id, first_name, last_name, username, language_code, photo_url, is_premium}
    auth_date: int                  # unix seconds
    query_id: str | None
    start_param: str | None         # значение из ?startapp=... (deep-link)
    chat_instance: str | None
    raw: dict[str, str]             # все остальные ключи как есть

    @property
    def tg_id(self) -> int:
        return int(self.user["id"])


def validate_init_data(
    init_data: str,
    bot_token: str,
    *,
    max_age_sec: int = 86400,
    clock: float | None = None,
) -> TelegramInitData:
    """Провалидировать и распарсить initData.

    Args:
        init_data: URL-encoded строка из `window.Telegram.WebApp.initData`.
        bot_token: токен бота из BotFather.
        max_age_sec: максимальный возраст auth_date.
        clock: для тестов — подменяемое "сейчас" в unix-seconds.

    Raises:
        InitDataInvalidHash | InitDataExpired | InitDataMalformed.

    Returns:
        TelegramInitData с распакованным user'ом.
    """
    if not init_data:
        raise InitDataMalformed("empty initData")
    if not bot_token:
        raise InitDataMalformed("empty bot_token (server misconfig)")

    # parse_qsl сохраняет порядок и не теряет повторы — для initData достаточно.
    pairs = dict(parse_qsl(init_data, keep_blank_values=True, strict_parsing=False))
    received_hash = pairs.pop("hash", None)
    if not received_hash:
        raise InitDataMalformed("hash missing")

    # data_check_string: все остальные ключи отсортированы лексикографически и склеены '\n'.
    data_check_string = "\n".join(f"{k}={pairs[k]}" for k in sorted(pairs.keys()))

    # secret_key = HMAC_SHA256(b"WebAppData", bot_token)
    secret_key = hmac.new(b"WebAppData", bot_token.encode("utf-8"), hashlib.sha256).digest()
    expected_hash = hmac.new(secret_key, data_check_string.encode("utf-8"), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected_hash, received_hash):
        raise InitDataInvalidHash("hash mismatch")

    # auth_date — обязателен, иначе replay уязвимость.
    raw_auth_date = pairs.get("auth_date")
    if not raw_auth_date or not raw_auth_date.isdigit():
        raise InitDataMalformed("auth_date missing or not integer")
    auth_date = int(raw_auth_date)
    now = int(clock if clock is not None else time.time())
    if now - auth_date > max_age_sec:
        raise InitDataExpired(f"auth_date is {now - auth_date}s old, max {max_age_sec}s")

    # user — JSON-строка
    user_raw = pairs.get("user")
    if not user_raw:
        raise InitDataMalformed("user payload missing")
    try:
        user = json.loads(user_raw)
    except json.JSONDecodeError as e:
        raise InitDataMalformed(f"user is not valid JSON: {e}") from e
    if "id" not in user:
        raise InitDataMalformed("user.id missing")

    return TelegramInitData(
        user=user,
        auth_date=auth_date,
        query_id=pairs.get("query_id"),
        start_param=pairs.get("start_param"),
        chat_instance=pairs.get("chat_instance"),
        raw=pairs,
    )
