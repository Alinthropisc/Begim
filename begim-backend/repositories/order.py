"""OrderRepository — заказы + items + status log."""
from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import desc, select
from sqlalchemy.orm import selectinload

from models.enums import OrderStatus
from models.order import Order
from repositories.base_repository import BaseRepository


class OrderRepository(BaseRepository[Order]):
    model = Order

    async def get_with_items(self, order_id: int) -> Order | None:
        stmt = (
            select(Order)
            .where(Order.id == order_id)
            .options(
                selectinload(Order.items),
                selectinload(Order.status_logs),
            )
        )
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def list_for_buyer(
        self,
        buyer_id: int,
        *,
        status: OrderStatus | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[Sequence[Order], int]:
        from sqlalchemy import func

        cond = [Order.buyer_id == buyer_id]
        if status is not None:
            cond.append(Order.status == status)

        items_stmt = (
            select(Order)
            .where(*cond)
            .options(selectinload(Order.items))
            .order_by(desc(Order.id))
            .offset(offset)
            .limit(limit)
        )
        items = (await self.session.execute(items_stmt)).scalars().unique().all()
        total = int((await self.session.execute(select(func.count(Order.id)).where(*cond))).scalar_one())
        return items, total

    async def list_for_seller(
        self,
        seller_id: int,
        *,
        status: OrderStatus | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[Sequence[Order], int]:
        from sqlalchemy import func

        cond = [Order.seller_id == seller_id]
        if status is not None:
            cond.append(Order.status == status)

        items_stmt = (
            select(Order)
            .where(*cond)
            .options(selectinload(Order.items))
            .order_by(desc(Order.id))
            .offset(offset)
            .limit(limit)
        )
        items = (await self.session.execute(items_stmt)).scalars().unique().all()
        total = int((await self.session.execute(select(func.count(Order.id)).where(*cond))).scalar_one())
        return items, total
