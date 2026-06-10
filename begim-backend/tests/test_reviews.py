"""Unit tests for ReviewService business rules. No DB — UoW is mocked."""
from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from models.enums import OrderStatus
from services.reviews import (
    CreateReviewInput,
    ReviewForbidden,
    ReviewNotAllowed,
    ReviewOrderNotFound,
    ReviewService,
)


def _order(
    order_id: int = 1,
    buyer_id: int = 42,
    seller_id: int = 7,
    status: OrderStatus = OrderStatus.DELIVERED,
):
    return SimpleNamespace(id=order_id, buyer_id=buyer_id, seller_id=seller_id, status=status)


def _make_uow(*, order=None, existing_review=None):
    uow = MagicMock()
    uow.__aenter__ = AsyncMock(return_value=uow)
    uow.__aexit__ = AsyncMock(return_value=False)
    uow.orders.get_by_id = AsyncMock(return_value=order)
    uow.reviews.get_by_order = AsyncMock(return_value=existing_review)
    uow.reviews.avg_for_seller = AsyncMock(return_value=(4.5, 10))
    uow.sellers.get_by_id = AsyncMock(return_value=MagicMock())
    uow.session = MagicMock()
    uow.flush = AsyncMock()
    return MagicMock(return_value=uow)


# ── Rating validation ──────────────────────────────────────────

class TestRatingValidation:
    @pytest.mark.asyncio
    @pytest.mark.parametrize("bad_rating", [0, -1, 6, 100])
    async def test_invalid_rating_raises(self, bad_rating):
        svc = ReviewService(uow_factory=_make_uow())
        with pytest.raises(ReviewNotAllowed, match="rating must be 1..5"):
            await svc.create(42, CreateReviewInput(order_id=1, rating=bad_rating))

    @pytest.mark.asyncio
    @pytest.mark.parametrize("good_rating", [1, 2, 3, 4, 5])
    async def test_valid_ratings_pass(self, good_rating):
        svc = ReviewService(uow_factory=_make_uow(order=_order()))
        review = await svc.create(42, CreateReviewInput(order_id=1, rating=good_rating))
        assert review is not None


# ── Order guards ───────────────────────────────────────────────

class TestOrderGuards:
    @pytest.mark.asyncio
    async def test_order_not_found(self):
        svc = ReviewService(uow_factory=_make_uow(order=None))
        with pytest.raises(ReviewOrderNotFound):
            await svc.create(42, CreateReviewInput(order_id=99, rating=5))

    @pytest.mark.asyncio
    async def test_wrong_buyer_is_forbidden(self):
        svc = ReviewService(uow_factory=_make_uow(order=_order(buyer_id=42)))
        with pytest.raises(ReviewForbidden, match="only buyer can review"):
            await svc.create(999, CreateReviewInput(order_id=1, rating=5))

    @pytest.mark.asyncio
    @pytest.mark.parametrize("bad_status", [
        OrderStatus.NEW,
        OrderStatus.ACCEPTED,
        OrderStatus.IN_PROGRESS,
        OrderStatus.READY,
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.CANCELLED,
    ])
    async def test_non_delivered_not_reviewable(self, bad_status):
        svc = ReviewService(uow_factory=_make_uow(order=_order(status=bad_status)))
        with pytest.raises(ReviewNotAllowed, match="order must be delivered first"):
            await svc.create(42, CreateReviewInput(order_id=1, rating=4))

    @pytest.mark.asyncio
    async def test_duplicate_review_rejected(self):
        svc = ReviewService(uow_factory=_make_uow(order=_order(), existing_review=MagicMock()))
        with pytest.raises(ReviewNotAllowed, match="review already exists"):
            await svc.create(42, CreateReviewInput(order_id=1, rating=5))


# ── Happy path ────────────────────────────────────────────────

class TestCreateReviewHappyPath:
    @pytest.mark.asyncio
    async def test_review_has_correct_fields(self):
        order = _order(order_id=10, buyer_id=42, seller_id=7)
        svc = ReviewService(uow_factory=_make_uow(order=order))
        review = await svc.create(42, CreateReviewInput(order_id=10, rating=5, body="Amazing!"))

        assert review.order_id == 10
        assert review.seller_id == 7
        assert review.author_id == 42
        assert review.rating == 5
        assert review.body == "Amazing!"

    @pytest.mark.asyncio
    async def test_review_without_body(self):
        svc = ReviewService(uow_factory=_make_uow(order=_order()))
        review = await svc.create(42, CreateReviewInput(order_id=1, rating=3))
        assert review.body is None
