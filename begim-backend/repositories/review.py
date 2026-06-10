from __future__ import annotations

from sqlalchemy import desc, func, select

from models.review import Review
from repositories.base_repository import BaseRepository


class ReviewRepository(BaseRepository[Review]):
    model = Review

    async def get_by_order(self, order_id: int) -> Review | None:
        stmt = select(Review).where(Review.order_id == order_id, Review.is_deleted.is_(False))
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def list_for_seller(self, seller_id: int, offset: int = 0, limit: int = 20):
        cond = [Review.seller_id == seller_id, Review.is_deleted.is_(False)]
        items_stmt = (
            select(Review).where(*cond)
            .order_by(desc(Review.id)).offset(offset).limit(limit)
        )
        items = (await self.session.execute(items_stmt)).scalars().all()
        total = int((await self.session.execute(select(func.count(Review.id)).where(*cond))).scalar_one())
        return items, total

    async def avg_for_seller(self, seller_id: int) -> tuple[float, int]:
        stmt = (
            select(func.avg(Review.rating), func.count(Review.id))
            .where(Review.seller_id == seller_id, Review.is_deleted.is_(False))
        )
        avg, cnt = (await self.session.execute(stmt)).one()
        return float(avg or 0), int(cnt or 0)
