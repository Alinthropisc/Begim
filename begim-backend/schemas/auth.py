"""Pydantic DTO для auth-эндпоинтов."""
from __future__ import annotations

from pydantic import BaseModel, Field

from schemas.user import UserOut


class TelegramLoginIn(BaseModel):
    """Body для POST /auth/telegram."""

    init_data: str = Field(min_length=1, description="window.Telegram.WebApp.initData (URL-encoded)")


class RefreshIn(BaseModel):
    refresh_token: str = Field(min_length=10)


class LogoutIn(BaseModel):
    refresh_token: str = Field(min_length=10)


class AuthTokensOut(BaseModel):
    access_token: str
    refresh_token: str
    access_exp: int
    refresh_exp: int
    token_type: str = "Bearer"
    user: UserOut


class AuthErrorOut(BaseModel):
    code: str
    message: str
