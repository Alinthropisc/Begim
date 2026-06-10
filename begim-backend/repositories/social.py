"""Repository-функции для соц-сущностей.

Объединены в один модуль ради краткости — это тонкие CRUD'ы вокруг базовых таблиц.
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import desc, func, select

from models.community import CommunityPost, PostComment, PostLike
from models.enums import NotificationType, SellerVerification
from models.follow import Follow
from models.notification import Notification
from models.recipe import Recipe, RecipeComment, RecipeLike, RecipeSave
from models.story import Story, StoryView
from repositories.base_repository import BaseRepository


class StoryRepository(BaseRepository[Story]):
    model = Story

    async def feed_for_user(self, user_id: int, *, city_id: int | None, limit: int = 50):
        """Активные сторис: либо от продавцов, на которых юзер подписан,
        либо от верифицированных продавцов того же города. Свежие первыми."""
        from models.seller_profile import SellerProfile

        now = datetime.now(timezone.utc)
        followed_subq = select(Follow.seller_id).where(Follow.follower_id == user_id)
        cond = [
            Story.expires_at > now,
            Story.is_archived.is_(False),
        ]
        # Простая стратегия: подписки ИЛИ верифицированные в моём городе.
        # Подзапросы по seller_id'ам:
        stmt = (
            select(Story)
            .join(SellerProfile, SellerProfile.id == Story.seller_id)
            .where(*cond)
            .where(
                (Story.seller_id.in_(followed_subq))
                | (
                    (SellerProfile.verification == SellerVerification.VERIFIED)
                    & ((city_id is None) | (SellerProfile.city_id == city_id))
                )
            )
            .order_by(desc(Story.id))
            .limit(limit)
        )
        return (await self.session.execute(stmt)).scalars().all()


class StoryViewRepository(BaseRepository[StoryView]):
    model = StoryView


class RecipeRepository(BaseRepository[Recipe]):
    model = Recipe

    async def list_published(self, *, q: str | None, city_id: int | None, offset: int, limit: int):
        cond = [Recipe.is_published.is_(True), Recipe.is_deleted.is_(False)]
        if city_id is not None:
            cond.append(Recipe.city_id == city_id)
        base = select(Recipe).where(*cond)
        if q:
            from sqlalchemy import text

            base = base.where(
                text("MATCH(recipes.title, recipes.description) AGAINST (:ftq IN BOOLEAN MODE)")
                .bindparams(ftq=" ".join(f"+{t}*" for t in q.split() if len(t) >= 2))
            )
        items_stmt = base.order_by(desc(Recipe.id)).offset(offset).limit(limit)
        items = (await self.session.execute(items_stmt)).scalars().all()
        total = int((await self.session.execute(select(func.count(Recipe.id)).where(*cond))).scalar_one())
        return items, total


class CommunityPostRepository(BaseRepository[CommunityPost]):
    model = CommunityPost

    async def feed(self, *, city_id: int | None, offset: int, limit: int):
        cond = [CommunityPost.is_deleted.is_(False)]
        if city_id is not None:
            cond.append(CommunityPost.city_id == city_id)
        items = (
            await self.session.execute(
                select(CommunityPost).where(*cond).order_by(desc(CommunityPost.id)).offset(offset).limit(limit)
            )
        ).scalars().all()
        total = int((await self.session.execute(select(func.count(CommunityPost.id)).where(*cond))).scalar_one())
        return items, total


class FollowRepository(BaseRepository[Follow]):
    model = Follow

    async def exists_pair(self, follower_id: int, seller_id: int) -> bool:
        stmt = select(Follow.id).where(Follow.follower_id == follower_id, Follow.seller_id == seller_id)
        return (await self.session.execute(stmt)).scalar_one_or_none() is not None

    async def list_seller_ids_for(self, follower_id: int) -> list[int]:
        stmt = select(Follow.seller_id).where(Follow.follower_id == follower_id)
        return [r[0] for r in (await self.session.execute(stmt)).all()]


class NotificationRepository(BaseRepository[Notification]):
    model = Notification

    async def list_for_user(self, user_id: int, *, offset: int = 0, limit: int = 30, only_unread: bool = False):
        cond = [Notification.user_id == user_id]
        if only_unread:
            cond.append(Notification.read_at.is_(None))
        items = (
            await self.session.execute(
                select(Notification).where(*cond).order_by(desc(Notification.id)).offset(offset).limit(limit)
            )
        ).scalars().all()
        total = int((await self.session.execute(select(func.count(Notification.id)).where(*cond))).scalar_one())
        return items, total
