"""PaymentRepository."""
from __future__ import annotations

from sqlalchemy import select

from models.enums import PaymentStatus
from models.payment import Payment
from repositories.base_repository import BaseRepository


class PaymentRepository(BaseRepository[Payment]):
    model = Payment

    async def get_by_external_id(self, external_id: str) -> Payment | None:
        stmt = select(Payment).where(Payment.external_id == external_id)
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def find_active_for_order(self, order_id: int) -> Payment | None:
        """Найти платёж в активном (не финальном) состоянии."""
        stmt = (
            select(Payment)
            .where(
                Payment.order_id == order_id,
                Payment.status.in_([PaymentStatus.PENDING, PaymentStatus.AUTHORIZED]),
            )
            .order_by(Payment.id.desc())
            .limit(1)
        )
        return (await self.session.execute(stmt)).scalar_one_or_none()
