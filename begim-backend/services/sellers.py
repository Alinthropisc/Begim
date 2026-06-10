"""SellerService — стать продавцом, редактировать профиль.

Slug — основа красивой ссылки `t.me/BegimBot/app?startapp=s_<slug>`. Генерится
из `brand_name` (translit + lowercase), при коллизии добавляем числовой суффикс.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

from models.enums import UserRole
from models.seller_profile import SellerProfile
from models.user import User
from repositories import UnitOfWork


class SellerError(Exception):
    pass


class SellerAlreadyExists(SellerError):
    pass


class SellerNotFound(SellerError):
    pass


@dataclass(slots=True)
class CreateSellerInput:
    brand_name: str
    bio: str | None = None
    contact_phone_e164: str | None = None
    contact_tg_username: str | None = None
    city_id: int | None = None


@dataclass(slots=True)
class UpdateSellerInput:
    brand_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    cover_url: str | None = None
    contact_phone_e164: str | None = None
    contact_tg_username: str | None = None
    delivery_info: str | None = None
    city_id: int | None = None
    address_hint: str | None = None


class SellerService:
    """Use cases вокруг `SellerProfile`."""

    def __init__(self, uow_factory=UnitOfWork) -> None:
        self._uow_factory = uow_factory

    async def become_seller(self, user_id: int, data: CreateSellerInput) -> SellerProfile:
        async with self._uow_factory() as uow:
            existing = await uow.sellers.get_by_user_id(user_id)
            if existing is not None:
                raise SellerAlreadyExists("user already has seller profile")

            user = await uow.users.get_by_id(user_id)
            if user is None:
                raise SellerNotFound("user not found")

            slug = await self._make_unique_slug(uow, data.brand_name)
            seller = SellerProfile(
                user_id=user_id,
                brand_name=data.brand_name.strip(),
                slug=slug,
                bio=data.bio,
                contact_phone_e164=data.contact_phone_e164,
                contact_tg_username=data.contact_tg_username,
                city_id=data.city_id or user.city_id,
            )
            uow.session.add(seller)

            # Повышаем роль; admin остаётся admin'ом.
            if user.role == UserRole.CUSTOMER:
                user.role = UserRole.SELLER

            await uow.flush()
            return seller

    async def get_public(self, id_or_slug: str) -> tuple[SellerProfile, User]:
        async with self._uow_factory() as uow:
            seller: SellerProfile | None
            if id_or_slug.isdigit():
                seller = await uow.sellers.get_by_id(int(id_or_slug))
            else:
                seller = await uow.sellers.get_by_slug(id_or_slug)
            if seller is None:
                raise SellerNotFound("seller not found")
            user = await uow.users.get_by_id(seller.user_id)
            assert user is not None
            return seller, user

    async def update_my(self, user_id: int, data: UpdateSellerInput) -> SellerProfile:
        async with self._uow_factory() as uow:
            seller = await uow.sellers.get_by_user_id(user_id)
            if seller is None:
                raise SellerNotFound("seller profile not found")

            if data.brand_name is not None:
                seller.brand_name = data.brand_name.strip()
            if data.bio is not None:
                seller.bio = data.bio
            if data.avatar_url is not None:
                seller.avatar_url = data.avatar_url
            if data.cover_url is not None:
                seller.cover_url = data.cover_url
            if data.contact_phone_e164 is not None:
                seller.contact_phone_e164 = data.contact_phone_e164
            if data.contact_tg_username is not None:
                seller.contact_tg_username = data.contact_tg_username
            if data.delivery_info is not None:
                seller.delivery_info = data.delivery_info
            if data.city_id is not None:
                seller.city_id = data.city_id
            if data.address_hint is not None:
                seller.address_hint = data.address_hint

            await uow.flush()
            return seller

    # ----- helpers -----

    async def _make_unique_slug(self, uow: UnitOfWork, raw: str) -> str:
        base = _slugify(raw) or "seller"
        candidate = base
        n = 1
        while await uow.sellers.slug_exists(candidate):
            n += 1
            candidate = f"{base}-{n}"
            if n > 999:
                raise SellerError("cannot allocate slug")
        return candidate


# ----- slugify -----

_SLUG_NON_ALNUM = re.compile(r"[^a-z0-9]+")


def _slugify(text: str) -> str:
    """Транслит для кириллицы/латиницы, всё в [a-z0-9-]."""
    # Базовый NFKD-стрип диакритики (для латиницы).
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii").lower()
    if not ascii_text.strip():
        # Кириллицу NFKD не разложит — простая map-таблица.
        ascii_text = _translit_ru(text).lower()
    ascii_text = _SLUG_NON_ALNUM.sub("-", ascii_text).strip("-")
    return ascii_text[:48]


_RU_MAP = {
    "а": "a",
    "б": "b",
    "в": "v",
    "г": "g",
    "д": "d",
    "е": "e",
    "ё": "yo",
    "ж": "zh",
    "з": "z",
    "и": "i",
    "й": "y",
    "к": "k",
    "л": "l",
    "м": "m",
    "н": "n",
    "о": "o",
    "п": "p",
    "р": "r",
    "с": "s",
    "т": "t",
    "у": "u",
    "ф": "f",
    "х": "h",
    "ц": "ts",
    "ч": "ch",
    "ш": "sh",
    "щ": "shch",
    "ъ": "",
    "ы": "y",
    "ь": "",
    "э": "e",
    "ю": "yu",
    "я": "ya",
    "ў": "u",
    "қ": "q",
    "ғ": "g",
    "ҳ": "h",
}


def _translit_ru(text: str) -> str:
    out = []
    for ch in text:
        low = ch.lower()
        out.append(_RU_MAP.get(low, ch))
    return "".join(out)
