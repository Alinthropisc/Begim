"""Pydantic DTO для User."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from models.enums import Locale, UserRole


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tg_id: int
    tg_username: str | None = None
    display_name: str | None = None
    tg_photo_url: str | None = None
    role: UserRole
    locale: Locale
    city_id: int | None = None
    is_tg_premium: bool = False
    marketing_opt_in: bool = False


class UserMeUpdate(BaseModel):
    """PATCH /me — частичный апдейт пользовательских настроек."""

    display_name: str | None = Field(default=None, max_length=128)
    locale: Locale | None = None
    city_id: int | None = None
    marketing_opt_in: bool | None = None
