"""JWT-токены: access + refresh.

Симметричный HS256 поверх `settings.secret_key` — для нашего масштаба сильно
проще ассиметричных схем и без потери безопасности.

Refresh-токены — отдельный `kind="refresh"` claim. Чтобы инвалидировать
рефреши (logout / смена пароля / бан), храним в Redis `auth:refresh:<jti>` ключ
со значением `user_id` и TTL = refresh_ttl. При logout удаляем; при выдаче
нового access проверяем существование.

Этот модуль — чистый по отношению к домену; о пользователях не знает.
"""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass
from typing import Any, Literal

import jwt

from app.config import settings

TokenKind = Literal["access", "refresh"]


class TokenError(Exception):
    """Невалидный/просроченный токен."""


@dataclass(slots=True, frozen=True)
class TokenPayload:
    sub: str  # user_id (string, спека JWT)
    kind: TokenKind
    jti: str
    iat: int
    exp: int
    extra: dict[str, Any]

    @property
    def user_id(self) -> int:
        return int(self.sub)


def issue_token(
    user_id: int,
    kind: TokenKind,
    *,
    ttl_sec: int | None = None,
    extra: dict[str, Any] | None = None,
) -> tuple[str, TokenPayload]:
    """Создать подписанный JWT. Возвращает (token_str, payload)."""
    now = int(time.time())
    default_ttl = settings.jwt_access_ttl_sec if kind == "access" else settings.jwt_refresh_ttl_sec
    exp = now + (ttl_sec if ttl_sec is not None else default_ttl)
    jti = uuid.uuid4().hex

    claims: dict[str, Any] = {
        "sub": str(user_id),
        "kind": kind,
        "jti": jti,
        "iat": now,
        "exp": exp,
    }
    if extra:
        claims.update(extra)

    token = jwt.encode(claims, settings.secret_key, algorithm=settings.jwt_algorithm)
    return token, TokenPayload(sub=str(user_id), kind=kind, jti=jti, iat=now, exp=exp, extra=extra or {})


def decode_token(token: str, *, expected_kind: TokenKind | None = None) -> TokenPayload:
    """Распарсить и проверить токен. Бросает TokenError."""
    try:
        claims = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
    except jwt.ExpiredSignatureError as e:
        raise TokenError("token expired") from e
    except jwt.InvalidTokenError as e:
        raise TokenError(f"invalid token: {e}") from e

    kind = claims.get("kind")
    if expected_kind is not None and kind != expected_kind:
        raise TokenError(f"wrong token kind: got {kind!r}, expected {expected_kind!r}")
    if "sub" not in claims or "jti" not in claims:
        raise TokenError("malformed claims")

    return TokenPayload(
        sub=str(claims["sub"]),
        kind=kind,  # type: ignore[arg-type]
        jti=claims["jti"],
        iat=int(claims.get("iat", 0)),
        exp=int(claims.get("exp", 0)),
        extra={k: v for k, v in claims.items() if k not in {"sub", "kind", "jti", "iat", "exp"}},
    )
