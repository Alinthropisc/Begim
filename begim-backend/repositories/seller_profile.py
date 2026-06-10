"""SellerProfileRepository."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from models.seller_profile import SellerProfile
from repositories.base_repository import BaseRepository


class SellerProfileRepository(BaseRepository[SellerProfile]):
    model = SellerProfile

    async def get_by_user_id(self, user_id: int) -> SellerProfile | None:
        stmt = select(SellerProfile).where(SellerProfile.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> SellerProfile | None:
        stmt = (
            select(SellerProfile)
            .where(SellerProfile.slug == slug)
            .options(selectinload(SellerProfile.user))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def slug_exists(self, slug: str) -> bool:
        stmt = select(SellerProfile.id).where(SellerProfile.slug == slug).limit(1)
        return (await self.session.execute(stmt)).scalar_one_or_none() is not None
