"""DI-провайдеры для Litestar.

Litestar резолвит зависимости по имени параметра. Достаточно один раз указать
`dependencies={"current_user": Provide(provide_current_user)}` на уровне app —
и любой обработчик может попросить `current_user: User` в сигнатуре.

`provide_optional_user` нужен для эндпоинтов, где аутентификация опциональна
(публичный листинг, но если залогинен — добавляем персонализацию).
"""
from __future__ import annotations

from typing import TYPE_CHECKING

from litestar import Request
from litestar.exceptions import NotAuthorizedException

from app.lifecycle import get_redis
from models.enums import UserRole
from models.user import User
from repositories import UnitOfWork
from services.auth import AuthService
from services.security import TokenError, decode_token

if TYPE_CHECKING:
    pass


def _extract_bearer(request: Request) -> str | None:
    auth = request.headers.get("authorization")
    if not auth:
        return None
    parts = auth.split(None, 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1].strip() or None


async def provide_current_user(request: Request) -> User:
    """Извлечь пользователя из Bearer JWT. 401, если нет/невалидный/заблокирован."""
    token = _extract_bearer(request)
    if not token:
        raise NotAuthorizedException(detail="Missing Bearer token")
    try:
        payload = decode_token(token, expected_kind="access")
    except TokenError as e:
        raise NotAuthorizedException(detail=str(e)) from e

    async with UnitOfWork() as uow:
        user = await uow.users.get_by_id(payload.user_id)

    if user is None:
        raise NotAuthorizedException(detail="user not found")
    if user.is_blocked:
        raise NotAuthorizedException(detail="user blocked")
    return user


async def provide_optional_user(request: Request) -> User | None:
    """Не падает, если токена нет — отдаёт `None`."""
    token = _extract_bearer(request)
    if not token:
        return None
    try:
        payload = decode_token(token, expected_kind="access")
    except TokenError:
        return None

    async with UnitOfWork() as uow:
        user = await uow.users.get_by_id(payload.user_id)
    if user is None or user.is_blocked:
        return None
    return user


def provide_auth_service() -> AuthService:
    """AuthService — лёгкий объект, безопасно создавать на запрос."""
    return AuthService(redis=get_redis())


# ----- Role helpers -----

def ensure_admin(user: User) -> None:
    """Бросает 403, если не админ. Зовётся в начале handler'а."""
    from litestar.exceptions import PermissionDeniedException

    if user.role != UserRole.ADMIN:
        raise PermissionDeniedException("admin role required")


def ensure_seller(user: User) -> None:
    """Бросает 403, если не продавец и не админ."""
    from litestar.exceptions import PermissionDeniedException

    if user.role not in (UserRole.SELLER, UserRole.ADMIN):
        raise PermissionDeniedException("seller role required")
