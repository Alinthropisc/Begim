"""AuthService — единственный use-case аутентификации.

Сценарий:
1. Клиент шлёт `initData` от TG.
2. Валидируем HMAC, парсим user.
3. UoW: upsert User по `tg_id`.
4. Выпускаем access (JWT, in-memory) + refresh (JWT + jti в Redis с TTL).
5. На /auth/refresh: проверяем kind=refresh, jti в Redis, выпускаем новые токены
   (rotate — старый jti удаляем).
6. На /auth/logout: удаляем jti из Redis.

Зачем jti в Redis: без него refresh-токены нельзя инвалидировать (бан, logout,
смена устройства). Redis-ключ `auth:refresh:<jti>` = `user_id`, TTL = refresh_ttl.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

from loguru import logger

from app.config import settings
from models.user import User
from repositories import UnitOfWork
from services.security import (
    InitDataError,
    TokenError,
    decode_token,
    issue_token,
    validate_init_data,
)

if TYPE_CHECKING:
    from redis.asyncio import Redis


_REFRESH_KEY = "auth:refresh:{jti}"


class AuthError(Exception):
    """Базовая ошибка авторизации (отдаём 401)."""


class AuthInvalidCredentials(AuthError):
    pass


class AuthExpired(AuthError):
    pass


class AuthUserBlocked(AuthError):
    pass


@dataclass(slots=True, frozen=True)
class AuthResult:
    user: User
    access_token: str
    refresh_token: str
    access_exp: int
    refresh_exp: int


class AuthService:
    """HTTP-агностичный use-case логина/рефреша/логаута.

    Зависимости передаются конструктором → легко мокать в тестах.
    """

    def __init__(self, redis: Redis, uow_factory=UnitOfWork) -> None:
        self._redis = redis
        self._uow_factory = uow_factory

    # ----- login -----

    async def login_via_init_data(self, init_data: str) -> AuthResult:
        try:
            parsed = validate_init_data(
                init_data,
                bot_token=settings.telegram_bot_token,
                max_age_sec=settings.telegram_init_data_max_age_sec,
            )
        except InitDataError as e:
            logger.info("initData rejected: {}", e)
            raise AuthInvalidCredentials(str(e)) from e

        tg_user = parsed.user
        async with self._uow_factory() as uow:
            user, created = await uow.users.upsert_from_tg(
                tg_id=int(tg_user["id"]),
                tg_username=tg_user.get("username"),
                tg_first_name=tg_user.get("first_name"),
                tg_last_name=tg_user.get("last_name"),
                tg_photo_url=tg_user.get("photo_url"),
                tg_language_code=tg_user.get("language_code"),
                is_tg_premium=bool(tg_user.get("is_premium", False)),
            )

            if user.is_blocked:
                raise AuthUserBlocked("user blocked")

            if created:
                logger.info("new user: tg_id={}, id={}", user.tg_id, user.id)

            return await self._issue_pair(user)

    # ----- refresh -----

    async def refresh(self, refresh_token: str) -> AuthResult:
        try:
            payload = decode_token(refresh_token, expected_kind="refresh")
        except TokenError as e:
            raise AuthInvalidCredentials(f"bad refresh: {e}") from e

        # Проверка: refresh ещё жив в Redis (не отозван logout'ом).
        key = _REFRESH_KEY.format(jti=payload.jti)
        stored = await self._redis.get(key)
        if stored is None:
            raise AuthExpired("refresh revoked")

        # Подтянуть актуального юзера и проверить blocked.
        async with self._uow_factory() as uow:
            user = await uow.users.get_by_id(payload.user_id)
            if user is None:
                raise AuthInvalidCredentials("user gone")
            if user.is_blocked:
                raise AuthUserBlocked("user blocked")

            # Rotate: старый jti убираем, выдаём новую пару.
            await self._redis.delete(key)
            return await self._issue_pair(user)

    # ----- logout -----

    async def logout(self, refresh_token: str) -> None:
        try:
            payload = decode_token(refresh_token, expected_kind="refresh")
        except TokenError:
            return  # idempotent
        await self._redis.delete(_REFRESH_KEY.format(jti=payload.jti))

    # ----- read -----

    async def get_user(self, user_id: int) -> User | None:
        async with self._uow_factory() as uow:
            return await uow.users.get_by_id(user_id)

    # ----- helpers -----

    async def _issue_pair(self, user: User) -> AuthResult:
        access_token, access_payload = issue_token(user.id, "access")
        refresh_token, refresh_payload = issue_token(user.id, "refresh")
        await self._redis.set(
            _REFRESH_KEY.format(jti=refresh_payload.jti),
            str(user.id),
            ex=settings.jwt_refresh_ttl_sec,
        )
        return AuthResult(
            user=user,
            access_token=access_token,
            refresh_token=refresh_token,
            access_exp=access_payload.exp,
            refresh_exp=refresh_payload.exp,
        )
