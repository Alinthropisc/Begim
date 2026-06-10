"""UserRepository — операции над `users`.

Контракт: репозиторий **не делает commit** — это работа UoW/use-case'а.
`upsert_from_tg()` пишет/обновляет TG-поля «как есть» в одной транзакции,
сохраняя текущий `role`, `city_id`, `locale` и опт-ин — это пользовательские
настройки, перетирать их при каждом логине нельзя.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from models.enums import Locale, UserRole
from models.user import User
from repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User

    async def get_by_tg_id(self, tg_id: int) -> User | None:
        stmt = select(User).where(User.tg_id == tg_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def upsert_from_tg(
        self,
        *,
        tg_id: int,
        tg_username: str | None,
        tg_first_name: str | None,
        tg_last_name: str | None,
        tg_photo_url: str | None,
        tg_language_code: str | None,
        is_tg_premium: bool = False,
    ) -> tuple[User, bool]:
        """Создать пользователя или обновить TG-поля.

        Returns:
            (user, created): `created=True` при первом входе.
        """
        user = await self.get_by_tg_id(tg_id)
        created = False

        if user is None:
            # Первый вход: определяем locale по TG-локалу, ставим город=None (выберет в Mini App).
            initial_locale = _infer_locale(tg_language_code)
            role = UserRole.ADMIN if tg_id in settings.bootstrap_admin_tg_ids else UserRole.CUSTOMER
            user = User(
                tg_id=tg_id,
                tg_username=tg_username,
                tg_first_name=tg_first_name,
                tg_last_name=tg_last_name,
                tg_photo_url=tg_photo_url,
                tg_language_code=tg_language_code,
                is_tg_premium=is_tg_premium,
                role=role,
                locale=initial_locale,
                display_name=_compose_display_name(tg_first_name, tg_last_name, tg_username),
            )
            self.session.add(user)
            await self.session.flush()
            created = True
        else:
            # Повторный вход — обновляем только TG-поля. Settings юзера не трогаем.
            user.tg_username = tg_username
            user.tg_first_name = tg_first_name
            user.tg_last_name = tg_last_name
            user.tg_photo_url = tg_photo_url
            user.tg_language_code = tg_language_code
            user.is_tg_premium = is_tg_premium
            # Если admin прилетел из bootstrap-списка задним числом — повысим роль.
            if user.role == UserRole.CUSTOMER and tg_id in settings.bootstrap_admin_tg_ids:
                user.role = UserRole.ADMIN
            await self.session.flush()

        return user, created

    async def update_locale(self, user_id: int, locale: Locale) -> None:
        user = await self.get_by_id(user_id)
        if user:
            user.locale = locale
            await self.session.flush()

    async def update_city(self, user_id: int, city_id: int | None) -> None:
        user = await self.get_by_id(user_id)
        if user:
            user.city_id = city_id
            await self.session.flush()


# ----- helpers -----


def _infer_locale(tg_language_code: str | None) -> Locale:
    if not tg_language_code:
        return Locale.UZ
    code = tg_language_code.lower()
    if code.startswith("ru"):
        return Locale.RU
    if code.startswith("en"):
        return Locale.EN
    if code.startswith("uz"):
        return Locale.UZ
    return Locale.UZ


def _compose_display_name(
    first_name: str | None,
    last_name: str | None,
    username: str | None,
) -> str:
    parts = [p for p in (first_name, last_name) if p]
    if parts:
        return " ".join(parts)
    return username or "User"
