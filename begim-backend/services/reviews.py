"""ReviewService — отзывы только от **реальных** покупателей по DELIVERED заказам.

Защита:
- Один отзыв на заказ (UQ).
- Автор отзыва == buyer заказа.
- Order.status == DELIVERED.

После создания/удаления — денормализуем `SellerProfile.rating_avg`/`reviews_count`.
"""

from __future__ import annotations

from dataclasses import dataclass

from models.enums import OrderStatus
from models.review import Review
from repositories import UnitOfWork


class ReviewError(Exception):
    pass


class ReviewOrderNotFound(ReviewError):
    pass


class ReviewForbidden(ReviewError):
    pass


class ReviewNotAllowed(ReviewError):
    pass


@dataclass(slots=True)
class CreateReviewInput:
    order_id: int
    rating: int
    body: str | None = None


@dataclass(slots=True)
class ReplyInput:
    review_id: int
    reply: str


class ReviewService:
    def __init__(self, uow_factory=UnitOfWork) -> None:
        self._uow_factory = uow_factory

    async def create(self, author_user_id: int, data: CreateReviewInput) -> Review:
        if not 1 <= data.rating <= 5:
            raise ReviewNotAllowed("rating must be 1..5")

        async with self._uow_factory() as uow:
            order = await uow.orders.get_by_id(data.order_id)
            if order is None:
                raise ReviewOrderNotFound("order not found")
            if order.buyer_id != author_user_id:
                raise ReviewForbidden("only buyer can review")
            if order.status != OrderStatus.DELIVERED:
                raise ReviewNotAllowed("order must be delivered first")

            existing = await uow.reviews.get_by_order(order.id)
            if existing is not None:
                raise ReviewNotAllowed("review already exists for this order")

            review = Review(
                order_id=order.id,
                seller_id=order.seller_id,
                author_id=author_user_id,
                rating=data.rating,
                body=data.body,
            )
            uow.session.add(review)
            await uow.flush()

            await self._recalc_seller_rating(uow, order.seller_id)
            return review

    async def seller_reply(self, seller_user_id: int, data: ReplyInput) -> Review:
        async with self._uow_factory() as uow:
            review = await uow.reviews.get_by_id(data.review_id)
            if review is None:
                raise ReviewOrderNotFound("review not found")
            seller = await uow.sellers.get_by_user_id(seller_user_id)
            if seller is None or seller.id != review.seller_id:
                raise ReviewForbidden("not your review")
            review.seller_reply = data.reply
            await uow.flush()
            return review

    async def list_for_seller(self, seller_id: int, *, offset: int = 0, limit: int = 20):
        async with self._uow_factory() as uow:
            return await uow.reviews.list_for_seller(seller_id, offset=offset, limit=min(max(limit, 1), 50))

    async def _recalc_seller_rating(self, uow: UnitOfWork, seller_id: int) -> None:
        avg, cnt = await uow.reviews.avg_for_seller(seller_id)
        seller = await uow.sellers.get_by_id(seller_id)
        if seller is not None:
            seller.rating_avg = round(avg, 2)
            seller.reviews_count = cnt
