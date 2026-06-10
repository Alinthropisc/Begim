"""Сервисы для соц-части: Stories, Recipes, Community-posts, Follow, Notifications.

Намеренно держим в одном модуле — это тонкие use case'ы без сложной логики.
Если кто-то разрастётся (например, ленту начнём ранжировать ML-моделью) — вынесем.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy.exc import IntegrityError

from app.config import settings
from models.community import CommunityPost, PostLike
from models.enums import DifficultyLevel, SellerVerification
from models.follow import Follow
from models.recipe import Recipe, RecipeLike, RecipeSave
from models.story import Story, StoryView
from repositories import UnitOfWork


# ----- Common errors -----

class SocialError(Exception):
    pass


class NotFound(SocialError):
    pass


class Forbidden(SocialError):
    pass


class Conflict(SocialError):
    pass


# ----- Stories -----

@dataclass(slots=True)
class StoryCreateInput:
    media_url: str
    media_type: str = "image"
    caption: str | None = None
    tg_file_id: str | None = None
    product_id: int | None = None


class StoryService:
    def __init__(self, uow_factory=UnitOfWork) -> None:
        self._uow_factory = uow_factory

    async def create(self, user_id: int, data: StoryCreateInput) -> Story:
        async with self._uow_factory() as uow:
            seller = await uow.sellers.get_by_user_id(user_id)
            if seller is None:
                raise Forbidden("only sellers can post stories")
            if seller.verification != SellerVerification.VERIFIED:
                raise Forbidden("seller must be verified")
            story = Story(
                seller_id=seller.id,
                media_url=data.media_url,
                media_type=data.media_type,
                tg_file_id=data.tg_file_id,
                caption=data.caption,
                product_id=data.product_id,
                expires_at=datetime.now(timezone.utc) + timedelta(hours=settings.story_ttl_hours),
            )
            uow.session.add(story)
            await uow.flush()
            return story

    async def feed(self, user_id: int, city_id: int | None) -> list[Story]:
        async with self._uow_factory() as uow:
            return list(await uow.stories.feed_for_user(user_id, city_id=city_id))

    async def mark_view(self, user_id: int, story_id: int) -> None:
        async with self._uow_factory() as uow:
            story = await uow.stories.get_by_id(story_id)
            if story is None:
                raise NotFound("story not found")
            try:
                uow.session.add(StoryView(story_id=story_id, viewer_id=user_id))
                await uow.flush()
                story.views_count = (story.views_count or 0) + 1
            except IntegrityError:
                await uow.session.rollback()  # уже смотрел — идемпотентно

    async def delete(self, user_id: int, story_id: int) -> None:
        async with self._uow_factory() as uow:
            story = await uow.stories.get_by_id(story_id)
            if story is None:
                raise NotFound("story not found")
            seller = await uow.sellers.get_by_user_id(user_id)
            if seller is None or seller.id != story.seller_id:
                raise Forbidden("not your story")
            story.is_archived = True


# ----- Recipes -----

@dataclass(slots=True)
class RecipeCreateInput:
    title: str
    description: str | None = None
    cover_url: str | None = None
    cook_time_min: int | None = None
    servings: int | None = None
    difficulty: DifficultyLevel = DifficultyLevel.EASY
    ingredients: list[dict] | None = None
    steps: list[dict] | None = None
    tags: list[str] | None = None
    city_id: int | None = None


class RecipeService:
    def __init__(self, uow_factory=UnitOfWork) -> None:
        self._uow_factory = uow_factory

    async def create(self, author_id: int, data: RecipeCreateInput) -> Recipe:
        async with self._uow_factory() as uow:
            recipe = Recipe(
                author_id=author_id,
                title=data.title.strip(),
                description=data.description,
                cover_url=data.cover_url,
                cook_time_min=data.cook_time_min,
                servings=data.servings,
                difficulty=data.difficulty,
                ingredients=data.ingredients or [],
                steps=data.steps or [],
                tags=data.tags or [],
                city_id=data.city_id,
            )
            uow.session.add(recipe)
            await uow.flush()
            return recipe

    async def list(self, q: str | None, city_id: int | None, offset: int, limit: int):
        async with self._uow_factory() as uow:
            return await uow.recipes.list_published(
                q=q, city_id=city_id, offset=offset, limit=min(max(limit, 1), 50)
            )

    async def get(self, recipe_id: int) -> Recipe:
        async with self._uow_factory() as uow:
            recipe = await uow.recipes.get_by_id(recipe_id)
            if recipe is None or recipe.is_deleted:
                raise NotFound("recipe not found")
            return recipe

    async def toggle_like(self, user_id: int, recipe_id: int) -> bool:
        async with self._uow_factory() as uow:
            recipe = await uow.recipes.get_by_id(recipe_id)
            if recipe is None:
                raise NotFound("recipe not found")
            from sqlalchemy import select

            existing = (
                await uow.session.execute(
                    select(RecipeLike).where(
                        RecipeLike.recipe_id == recipe_id, RecipeLike.user_id == user_id
                    )
                )
            ).scalar_one_or_none()
            if existing is None:
                uow.session.add(RecipeLike(recipe_id=recipe_id, user_id=user_id))
                recipe.likes_count = (recipe.likes_count or 0) + 1
                return True
            await uow.session.delete(existing)
            recipe.likes_count = max(0, (recipe.likes_count or 0) - 1)
            return False

    async def toggle_save(self, user_id: int, recipe_id: int) -> bool:
        async with self._uow_factory() as uow:
            recipe = await uow.recipes.get_by_id(recipe_id)
            if recipe is None:
                raise NotFound("recipe not found")
            from sqlalchemy import select

            existing = (
                await uow.session.execute(
                    select(RecipeSave).where(
                        RecipeSave.recipe_id == recipe_id, RecipeSave.user_id == user_id
                    )
                )
            ).scalar_one_or_none()
            if existing is None:
                uow.session.add(RecipeSave(recipe_id=recipe_id, user_id=user_id))
                recipe.saves_count = (recipe.saves_count or 0) + 1
                return True
            await uow.session.delete(existing)
            recipe.saves_count = max(0, (recipe.saves_count or 0) - 1)
            return False


# ----- Community -----

@dataclass(slots=True)
class CommunityPostCreateInput:
    body: str
    photos: list[str] | None = None
    tags: list[str] | None = None
    product_id: int | None = None
    city_id: int | None = None


class CommunityService:
    def __init__(self, uow_factory=UnitOfWork) -> None:
        self._uow_factory = uow_factory

    async def create(self, author_id: int, data: CommunityPostCreateInput) -> CommunityPost:
        async with self._uow_factory() as uow:
            post = CommunityPost(
                author_id=author_id,
                body=data.body.strip(),
                photos=data.photos or [],
                tags=data.tags or [],
                product_id=data.product_id,
                city_id=data.city_id,
            )
            uow.session.add(post)
            await uow.flush()
            return post

    async def feed(self, city_id: int | None, offset: int, limit: int):
        async with self._uow_factory() as uow:
            return await uow.community_posts.feed(
                city_id=city_id, offset=offset, limit=min(max(limit, 1), 50)
            )

    async def toggle_like(self, user_id: int, post_id: int) -> bool:
        async with self._uow_factory() as uow:
            post = await uow.community_posts.get_by_id(post_id)
            if post is None:
                raise NotFound("post not found")
            from sqlalchemy import select

            existing = (
                await uow.session.execute(
                    select(PostLike).where(
                        PostLike.post_id == post_id, PostLike.user_id == user_id
                    )
                )
            ).scalar_one_or_none()
            if existing is None:
                uow.session.add(PostLike(post_id=post_id, user_id=user_id))
                post.likes_count = (post.likes_count or 0) + 1
                return True
            await uow.session.delete(existing)
            post.likes_count = max(0, (post.likes_count or 0) - 1)
            return False


# ----- Follow -----

class FollowService:
    def __init__(self, uow_factory=UnitOfWork) -> None:
        self._uow_factory = uow_factory

    async def follow(self, follower_id: int, seller_id: int) -> bool:
        async with self._uow_factory() as uow:
            seller = await uow.sellers.get_by_id(seller_id)
            if seller is None:
                raise NotFound("seller not found")
            if await uow.follows.exists_pair(follower_id, seller_id):
                return False
            uow.session.add(Follow(follower_id=follower_id, seller_id=seller_id))
            seller.followers_count = (seller.followers_count or 0) + 1
            return True

    async def unfollow(self, follower_id: int, seller_id: int) -> bool:
        async with self._uow_factory() as uow:
            from sqlalchemy import select

            existing = (
                await uow.session.execute(
                    select(Follow).where(
                        Follow.follower_id == follower_id, Follow.seller_id == seller_id
                    )
                )
            ).scalar_one_or_none()
            if existing is None:
                return False
            await uow.session.delete(existing)
            seller = await uow.sellers.get_by_id(seller_id)
            if seller is not None:
                seller.followers_count = max(0, (seller.followers_count or 0) - 1)
            return True


# ----- Notifications -----

class NotificationService:
    def __init__(self, uow_factory=UnitOfWork) -> None:
        self._uow_factory = uow_factory

    async def list(self, user_id: int, *, offset: int, limit: int, only_unread: bool):
        async with self._uow_factory() as uow:
            return await uow.notifications.list_for_user(
                user_id, offset=offset, limit=limit, only_unread=only_unread
            )

    async def mark_read(self, user_id: int, notification_id: int) -> None:
        async with self._uow_factory() as uow:
            n = await uow.notifications.get_by_id(notification_id)
            if n is None or n.user_id != user_id:
                raise NotFound("notification not found")
            if n.read_at is None:
                n.read_at = datetime.now(timezone.utc)

    async def mark_all_read(self, user_id: int) -> int:
        async with self._uow_factory() as uow:
            from sqlalchemy import update

            from models.notification import Notification

            now = datetime.now(timezone.utc)
            stmt = (
                update(Notification)
                .where(Notification.user_id == user_id, Notification.read_at.is_(None))
                .values(read_at=now)
            )
            result = await uow.session.execute(stmt)
            return result.rowcount or 0
