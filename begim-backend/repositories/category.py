"""CategoryRepository — двухуровневое дерево."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from models.category import Category
from repositories.base_repository import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    model = Category

    async def list_tree(self) -> list[Category]:
        """Только активные корни. Грузим два уровня детей, чтобы сериализация
        CategoryOut (рекурсивная по `children`) не триггерила async lazy-load."""
        stmt = select(Category).where(Category.parent_id.is_(None), Category.is_active.is_(True)).options(selectinload(Category.children).selectinload(Category.children)).order_by(Category.sort_order, Category.id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_slug(self, slug: str) -> Category | None:
        stmt = select(Category).where(Category.slug == slug)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
