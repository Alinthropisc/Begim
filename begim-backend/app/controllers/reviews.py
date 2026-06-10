"""POST /orders/{id}/review, POST /reviews/{id}/reply, GET /sellers/{id}/reviews."""

from __future__ import annotations

from litestar import Controller, get, post
from litestar.di import Provide
from litestar.exceptions import (
    ClientException,
    NotFoundException,
    PermissionDeniedException,
)
from litestar.params import Parameter

from app.config import settings
from models.user import User
from schemas.review import ReviewCreateIn, ReviewListOut, ReviewOut, ReviewReplyIn
from services.reviews import (
    CreateReviewInput,
    ReplyInput,
    ReviewForbidden,
    ReviewNotAllowed,
    ReviewOrderNotFound,
    ReviewService,
)


def _provide_review_service() -> ReviewService:
    return ReviewService()


class ReviewsController(Controller):
    path = settings.api_prefix
    tags = ["reviews"]
    dependencies = {"review_service": Provide(_provide_review_service, sync_to_thread=False)}

    @post("/orders/{order_id:int}/review", status_code=201)
    async def create_review(
        self,
        order_id: int,
        data: ReviewCreateIn,
        current_user: User,
        review_service: ReviewService,
    ) -> ReviewOut:
        try:
            review = await review_service.create(
                author_user_id=current_user.id,
                data=CreateReviewInput(order_id=order_id, rating=data.rating, body=data.body),
            )
        except ReviewOrderNotFound as e:
            raise NotFoundException(detail=str(e)) from e
        except ReviewForbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        except ReviewNotAllowed as e:
            raise ClientException(detail=str(e)) from e
        return ReviewOut.model_validate(review)

    @post("/reviews/{review_id:int}/reply")
    async def reply(
        self,
        review_id: int,
        data: ReviewReplyIn,
        current_user: User,
        review_service: ReviewService,
    ) -> ReviewOut:
        try:
            review = await review_service.seller_reply(
                seller_user_id=current_user.id,
                data=ReplyInput(review_id=review_id, reply=data.reply),
            )
        except ReviewOrderNotFound as e:
            raise NotFoundException(detail=str(e)) from e
        except ReviewForbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        return ReviewOut.model_validate(review)

    @get("/sellers/{seller_id:int}/reviews")
    async def list_for_seller(
        self,
        seller_id: int,
        review_service: ReviewService,
        offset: int = Parameter(query="offset", default=0),
        limit: int = Parameter(query="limit", default=20),
    ) -> ReviewListOut:
        items, total = await review_service.list_for_seller(seller_id, offset=offset, limit=limit)
        return ReviewListOut(
            items=[ReviewOut.model_validate(r) for r in items],
            total=total,
            offset=offset,
            limit=limit,
        )
