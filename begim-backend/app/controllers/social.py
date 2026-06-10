"""Контроллеры social-блока: stories, recipes, community-posts, follow, notifications."""

from litestar import Controller, Response, delete, get, post
from litestar.di import Provide
from litestar.exceptions import (
    ClientException,
    NotFoundException,
    PermissionDeniedException,
)
from litestar.params import Parameter

from app.config import settings
from models.user import User
from schemas.social import (
    NotificationListOut,
    NotificationOut,
    PostCreateIn,
    PostListOut,
    PostOut,
    RecipeCreateIn,
    RecipeListOut,
    RecipeOut,
    StoryCreateIn,
    StoryOut,
)
from services.social import (
    CommunityPostCreateInput,
    CommunityService,
    FollowService,
    Forbidden,
    NotFound,
    NotificationService,
    RecipeCreateInput,
    RecipeService,
    StoryCreateInput,
    StoryService,
)


# ----- providers -----

def _story_service(): return StoryService()
def _recipe_service(): return RecipeService()
def _community_service(): return CommunityService()
def _follow_service(): return FollowService()
def _notif_service(): return NotificationService()


# ----- Stories -----

class StoriesController(Controller):
    path = settings.api_prefix + "/stories"
    tags = ["stories"]
    dependencies = {"svc": Provide(_story_service, sync_to_thread=False)}

    @get("/feed")
    async def feed(self, current_user: User, svc: StoryService) -> list[StoryOut]:
        stories = await svc.feed(current_user.id, current_user.city_id)
        return [StoryOut.model_validate(s) for s in stories]

    @post("/", status_code=201)
    async def create(self, data: StoryCreateIn, current_user: User, svc: StoryService) -> StoryOut:
        try:
            story = await svc.create(current_user.id, StoryCreateInput(**data.model_dump()))
        except Forbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        return StoryOut.model_validate(story)

    @post("/{story_id:int}/view", status_code=204)
    async def view(self, story_id: int, current_user: User, svc: StoryService) -> None:
        try:
            await svc.mark_view(current_user.id, story_id)
        except NotFound as e:
            raise NotFoundException(detail=str(e)) from e

    @delete("/{story_id:int}", status_code=204)
    async def remove(self, story_id: int, current_user: User, svc: StoryService) -> None:
        try:
            await svc.delete(current_user.id, story_id)
        except NotFound as e:
            raise NotFoundException(detail=str(e)) from e
        except Forbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e


# ----- Recipes -----

class RecipesController(Controller):
    path = settings.api_prefix + "/recipes"
    tags = ["recipes"]
    dependencies = {"svc": Provide(_recipe_service, sync_to_thread=False)}

    @get("/")
    async def list_recipes(
        self,
        svc: RecipeService,
        q: str | None = Parameter(query="q", default=None),
        city: int | None = Parameter(query="city", default=None),
        offset: int = Parameter(query="offset", default=0),
        limit: int = Parameter(query="limit", default=20),
    ) -> RecipeListOut:
        items, total = await svc.list(q, city, offset, limit)
        return RecipeListOut(
            items=[RecipeOut.model_validate(r) for r in items],
            total=total, offset=offset, limit=limit,
        )

    @get("/{recipe_id:int}")
    async def get_recipe(self, recipe_id: int, svc: RecipeService) -> RecipeOut:
        try:
            recipe = await svc.get(recipe_id)
        except NotFound as e:
            raise NotFoundException(detail=str(e)) from e
        return RecipeOut.model_validate(recipe)

    @post("/", status_code=201)
    async def create(
        self, data: RecipeCreateIn, current_user: User, svc: RecipeService
    ) -> RecipeOut:
        recipe = await svc.create(current_user.id, RecipeCreateInput(**data.model_dump()))
        return RecipeOut.model_validate(recipe)

    @post("/{recipe_id:int}/like")
    async def like(self, recipe_id: int, current_user: User, svc: RecipeService) -> dict:
        try:
            liked = await svc.toggle_like(current_user.id, recipe_id)
        except NotFound as e:
            raise NotFoundException(detail=str(e)) from e
        return {"liked": liked}

    @post("/{recipe_id:int}/save")
    async def save(self, recipe_id: int, current_user: User, svc: RecipeService) -> dict:
        try:
            saved = await svc.toggle_save(current_user.id, recipe_id)
        except NotFound as e:
            raise NotFoundException(detail=str(e)) from e
        return {"saved": saved}


# ----- Community -----

class CommunityController(Controller):
    path = settings.api_prefix
    tags = ["community"]
    dependencies = {"svc": Provide(_community_service, sync_to_thread=False)}

    @get("/feed")
    async def feed(
        self,
        svc: CommunityService,
        optional_user: User | None,
        city: int | None = Parameter(query="city", default=None),
        offset: int = Parameter(query="offset", default=0),
        limit: int = Parameter(query="limit", default=20),
    ) -> PostListOut:
        effective_city = city if city is not None else (optional_user.city_id if optional_user else None)
        items, total = await svc.feed(effective_city, offset, limit)
        return PostListOut(
            items=[PostOut.model_validate(p) for p in items],
            total=total, offset=offset, limit=limit,
        )

    @post("/posts", status_code=201)
    async def create(self, data: PostCreateIn, current_user: User, svc: CommunityService) -> PostOut:
        post = await svc.create(current_user.id, CommunityPostCreateInput(**data.model_dump()))
        return PostOut.model_validate(post)

    @post("/posts/{post_id:int}/like")
    async def like(self, post_id: int, current_user: User, svc: CommunityService) -> dict:
        try:
            liked = await svc.toggle_like(current_user.id, post_id)
        except NotFound as e:
            raise NotFoundException(detail=str(e)) from e
        return {"liked": liked}


# ----- Follow -----

class FollowController(Controller):
    path = settings.api_prefix + "/sellers/{seller_id:int}/follow"
    tags = ["follow"]
    dependencies = {"svc": Provide(_follow_service, sync_to_thread=False)}

    @post("/", status_code=200)
    async def follow(self, seller_id: int, current_user: User, svc: FollowService) -> dict:
        try:
            created = await svc.follow(current_user.id, seller_id)
        except NotFound as e:
            raise NotFoundException(detail=str(e)) from e
        return {"following": True, "created": created}

    @delete("/", status_code=200)
    async def unfollow(self, seller_id: int, current_user: User, svc: FollowService) -> dict:
        removed = await svc.unfollow(current_user.id, seller_id)
        return {"following": False, "removed": removed}


# ----- Notifications -----

class NotificationsController(Controller):
    path = settings.api_prefix + "/me/notifications"
    tags = ["notifications"]
    dependencies = {"svc": Provide(_notif_service, sync_to_thread=False)}

    @get("/")
    async def list_my(
        self,
        current_user: User,
        svc: NotificationService,
        only_unread: bool = Parameter(query="only_unread", default=False),
        offset: int = Parameter(query="offset", default=0),
        limit: int = Parameter(query="limit", default=30),
    ) -> NotificationListOut:
        items, total = await svc.list(
            current_user.id, offset=offset, limit=limit, only_unread=only_unread
        )
        return NotificationListOut(
            items=[NotificationOut.model_validate(n) for n in items],
            total=total, offset=offset, limit=limit,
        )

    @post("/{notification_id:int}/read", status_code=204)
    async def read_one(
        self, notification_id: int, current_user: User, svc: NotificationService
    ) -> None:
        try:
            await svc.mark_read(current_user.id, notification_id)
        except NotFound as e:
            raise NotFoundException(detail=str(e)) from e

    @post("/read-all")
    async def read_all(self, current_user: User, svc: NotificationService) -> dict:
        count = await svc.mark_all_read(current_user.id)
        return {"updated": count}
