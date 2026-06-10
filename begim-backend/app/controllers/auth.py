"""POST /auth/telegram, /auth/refresh, /auth/logout."""

from litestar import Controller, Response, post
from litestar.di import Provide
from litestar.exceptions import NotAuthorizedException

from app.config import settings
from app.dependencies import provide_auth_service
from schemas.auth import AuthTokensOut, LogoutIn, RefreshIn, TelegramLoginIn
from schemas.user import UserOut
from services.auth import (
    AuthError,
    AuthExpired,
    AuthInvalidCredentials,
    AuthService,
    AuthUserBlocked,
)


def _map_auth_error(e: AuthError) -> NotAuthorizedException:
    """Доменные исключения → HTTP."""
    if isinstance(e, AuthUserBlocked):
        return NotAuthorizedException(detail="user blocked")
    if isinstance(e, AuthExpired):
        return NotAuthorizedException(detail="refresh expired")
    if isinstance(e, AuthInvalidCredentials):
        return NotAuthorizedException(detail=str(e))
    return NotAuthorizedException(detail="auth error")


class AuthController(Controller):
    path = settings.api_prefix + "/auth"
    tags = ["auth"]
    dependencies = {"auth_service": Provide(provide_auth_service, sync_to_thread=False)}

    @post("/telegram", status_code=200)
    async def telegram_login(
        self,
        data: TelegramLoginIn,
        auth_service: AuthService,
    ) -> AuthTokensOut:
        try:
            result = await auth_service.login_via_init_data(data.init_data)
        except AuthError as e:
            raise _map_auth_error(e) from e
        return _to_out(result)

    @post("/refresh", status_code=200)
    async def refresh(
        self,
        data: RefreshIn,
        auth_service: AuthService,
    ) -> AuthTokensOut:
        try:
            result = await auth_service.refresh(data.refresh_token)
        except AuthError as e:
            raise _map_auth_error(e) from e
        return _to_out(result)

    @post("/logout", status_code=204)
    async def logout(
        self,
        data: LogoutIn,
        auth_service: AuthService,
    ) -> None:
        await auth_service.logout(data.refresh_token)


def _to_out(result) -> AuthTokensOut:
    return AuthTokensOut(
        access_token=result.access_token,
        refresh_token=result.refresh_token,
        access_exp=result.access_exp,
        refresh_exp=result.refresh_exp,
        user=UserOut.model_validate(result.user),
    )
