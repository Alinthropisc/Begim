"""Регистрация всех ORM-моделей.

Импорт здесь нужен, чтобы Alembic autogenerate видел метаданные всех таблиц
(через `Base.metadata`). Если модель не импортирована — миграция её «не видит».
"""
from models.base import Base, IdMixin, SoftDeleteMixin, TimestampMixin
from models.broadcast import Broadcast, BroadcastDelivery
from models.category import Category
from models.channel_post import ChannelPost
from models.city import City
from models.community import CommunityPost, PostComment, PostLike
from models.enums import (
    BroadcastCta,
    BroadcastDeliveryStatus,
    BroadcastStatus,
    BroadcastTargetType,
    ContactImportStatus,
    Currency,
    DifficultyLevel,
    GroupMemberSource,
    Locale,
    NotificationType,
    OrderStatus,
    PaymentProvider,
    PaymentStatus,
    ProductStatus,
    SellerGroupPrivacy,
    SellerVerification,
    UserRole,
)
from models.follow import Follow
from models.notification import Notification
from models.order import Order, OrderItem, OrderStatusLog
from models.payment import Payment
from models.product import Product
from models.product_photo import ProductPhoto
from models.recipe import Recipe, RecipeComment, RecipeLike, RecipeSave
from models.review import Review
from models.seller_contact import SellerContact
from models.seller_group import SellerGroup, SellerGroupMember
from models.seller_profile import SellerProfile
from models.story import Story, StoryView
from models.user import User

__all__ = [
    "Base",
    "Broadcast",
    "BroadcastCta",
    "BroadcastDelivery",
    "BroadcastDeliveryStatus",
    "BroadcastStatus",
    "BroadcastTargetType",
    "Category",
    "ChannelPost",
    "City",
    "CommunityPost",
    "ContactImportStatus",
    "Currency",
    "DifficultyLevel",
    "Follow",
    "GroupMemberSource",
    "IdMixin",
    "Locale",
    "Notification",
    "NotificationType",
    "Order",
    "OrderItem",
    "OrderStatus",
    "OrderStatusLog",
    "Payment",
    "PaymentProvider",
    "PaymentStatus",
    "PostComment",
    "PostLike",
    "Product",
    "ProductPhoto",
    "ProductStatus",
    "Recipe",
    "RecipeComment",
    "RecipeLike",
    "RecipeSave",
    "Review",
    "SellerContact",
    "SellerGroup",
    "SellerGroupMember",
    "SellerGroupPrivacy",
    "SellerProfile",
    "SellerVerification",
    "SoftDeleteMixin",
    "Story",
    "StoryView",
    "TimestampMixin",
    "User",
    "UserRole",
]
