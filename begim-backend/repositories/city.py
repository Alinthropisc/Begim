"""CityRepository — справочник городов."""
from __future__ import annotations

from sqlalchemy import select

from models.city import City
from repositories.base_repository import BaseRepository


class CityRepository(BaseRepository[City]):
    model = City

    async def list_active(self) -> list[City]:
        stmt = select(City).where(City.is_active.is_(True)).order_by(City.sort_order, City.name_uz)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_slug(self, slug: str) -> City | None:
        stmt = select(City).where(City.slug == slug)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
