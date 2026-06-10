"""Unit of Work — тонкая обёртка над `db_session()`.

Зачем нужна, когда уже есть `db_session()`:
- даёт типизированные репозитории на одной сессии (`uow.users`, `uow.products`, ...);
- единая точка для тестов: мокаем UoW целиком вместо подмены сессии вручную;
- читаемо: use-case описывает «работу» в терминах репозиториев, не сессий.

Репозитории создаются **лениво** при первом доступе (property) — добавление
нового репо = одна property, без правки фабрики.
"""
from __future__ import annotations

from types import TracebackType
from typing import TYPE_CHECKING

from sqlalchemy.ext.asyncio import AsyncSession

from database import get_sessionmaker

if TYPE_CHECKING:
    from repositories.category import CategoryRepository
    from repositories.city import CityRepository
    from repositories.order import OrderRepository
    from repositories.payment import PaymentRepository
    from repositories.product import ProductRepository
    from repositories.review import ReviewRepository
    from repositories.seller_profile import SellerProfileRepository
    from repositories.loyalty import (
        BroadcastDeliveryRepository,
        BroadcastRepository,
        SellerContactRepository,
        SellerGroupMemberRepository,
        SellerGroupRepository,
    )
    from repositories.social import (
        CommunityPostRepository,
        FollowRepository,
        NotificationRepository,
        RecipeRepository,
        StoryRepository,
        StoryViewRepository,
    )
    from repositories.user import UserRepository


class UnitOfWork:
    """Использование:
        async with UnitOfWork() as uow:
            user = await uow.users.get_by_tg_id(123)
            # commit() произойдёт автоматически на выходе из блока
    """

    def __init__(self) -> None:
        self._session: AsyncSession | None = None
        self._users: "UserRepository | None" = None
        self._cities: "CityRepository | None" = None
        self._categories: "CategoryRepository | None" = None
        self._sellers: "SellerProfileRepository | None" = None
        self._products: "ProductRepository | None" = None
        self._orders: "OrderRepository | None" = None
        self._payments: "PaymentRepository | None" = None
        self._reviews: "ReviewRepository | None" = None
        self._stories: "StoryRepository | None" = None
        self._story_views: "StoryViewRepository | None" = None
        self._recipes: "RecipeRepository | None" = None
        self._community_posts: "CommunityPostRepository | None" = None
        self._follows: "FollowRepository | None" = None
        self._notifications: "NotificationRepository | None" = None
        self._seller_groups: "SellerGroupRepository | None" = None
        self._group_members: "SellerGroupMemberRepository | None" = None
        self._contacts: "SellerContactRepository | None" = None
        self._broadcasts: "BroadcastRepository | None" = None
        self._deliveries: "BroadcastDeliveryRepository | None" = None

    async def __aenter__(self) -> "UnitOfWork":
        sm = get_sessionmaker()
        self._session = sm()
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        assert self._session is not None
        try:
            if exc is None and self._session.in_transaction():
                await self._session.commit()
            elif self._session.in_transaction():
                await self._session.rollback()
        finally:
            await self._session.close()
            self._session = None

    @property
    def session(self) -> AsyncSession:
        if self._session is None:
            raise RuntimeError("UoW не открыт. Используй `async with UnitOfWork() as uow:`")
        return self._session

    async def commit(self) -> None:
        await self.session.commit()

    async def rollback(self) -> None:
        await self.session.rollback()

    async def flush(self) -> None:
        await self.session.flush()

    @property
    def users(self) -> "UserRepository":
        if self._users is None:
            from repositories.user import UserRepository

            self._users = UserRepository(self.session)
        return self._users

    @property
    def cities(self) -> "CityRepository":
        if self._cities is None:
            from repositories.city import CityRepository

            self._cities = CityRepository(self.session)
        return self._cities

    @property
    def categories(self) -> "CategoryRepository":
        if self._categories is None:
            from repositories.category import CategoryRepository

            self._categories = CategoryRepository(self.session)
        return self._categories

    @property
    def sellers(self) -> "SellerProfileRepository":
        if self._sellers is None:
            from repositories.seller_profile import SellerProfileRepository

            self._sellers = SellerProfileRepository(self.session)
        return self._sellers

    @property
    def products(self) -> "ProductRepository":
        if self._products is None:
            from repositories.product import ProductRepository

            self._products = ProductRepository(self.session)
        return self._products

    @property
    def orders(self) -> "OrderRepository":
        if self._orders is None:
            from repositories.order import OrderRepository

            self._orders = OrderRepository(self.session)
        return self._orders

    @property
    def payments(self) -> "PaymentRepository":
        if self._payments is None:
            from repositories.payment import PaymentRepository

            self._payments = PaymentRepository(self.session)
        return self._payments

    @property
    def reviews(self) -> "ReviewRepository":
        if self._reviews is None:
            from repositories.review import ReviewRepository

            self._reviews = ReviewRepository(self.session)
        return self._reviews

    @property
    def stories(self) -> "StoryRepository":
        if self._stories is None:
            from repositories.social import StoryRepository

            self._stories = StoryRepository(self.session)
        return self._stories

    @property
    def story_views(self) -> "StoryViewRepository":
        if self._story_views is None:
            from repositories.social import StoryViewRepository

            self._story_views = StoryViewRepository(self.session)
        return self._story_views

    @property
    def recipes(self) -> "RecipeRepository":
        if self._recipes is None:
            from repositories.social import RecipeRepository

            self._recipes = RecipeRepository(self.session)
        return self._recipes

    @property
    def community_posts(self) -> "CommunityPostRepository":
        if self._community_posts is None:
            from repositories.social import CommunityPostRepository

            self._community_posts = CommunityPostRepository(self.session)
        return self._community_posts

    @property
    def follows(self) -> "FollowRepository":
        if self._follows is None:
            from repositories.social import FollowRepository

            self._follows = FollowRepository(self.session)
        return self._follows

    @property
    def notifications(self) -> "NotificationRepository":
        if self._notifications is None:
            from repositories.social import NotificationRepository

            self._notifications = NotificationRepository(self.session)
        return self._notifications

    @property
    def seller_groups(self) -> "SellerGroupRepository":
        if self._seller_groups is None:
            from repositories.loyalty import SellerGroupRepository

            self._seller_groups = SellerGroupRepository(self.session)
        return self._seller_groups

    @property
    def group_members(self) -> "SellerGroupMemberRepository":
        if self._group_members is None:
            from repositories.loyalty import SellerGroupMemberRepository

            self._group_members = SellerGroupMemberRepository(self.session)
        return self._group_members

    @property
    def contacts(self) -> "SellerContactRepository":
        if self._contacts is None:
            from repositories.loyalty import SellerContactRepository

            self._contacts = SellerContactRepository(self.session)
        return self._contacts

    @property
    def broadcasts(self) -> "BroadcastRepository":
        if self._broadcasts is None:
            from repositories.loyalty import BroadcastRepository

            self._broadcasts = BroadcastRepository(self.session)
        return self._broadcasts

    @property
    def deliveries(self) -> "BroadcastDeliveryRepository":
        if self._deliveries is None:
            from repositories.loyalty import BroadcastDeliveryRepository

            self._deliveries = BroadcastDeliveryRepository(self.session)
        return self._deliveries
