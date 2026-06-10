"""Доменные enum'ы.

Все enum-ы — `str, Enum`, чтобы:
- Pydantic сериализовал как строку.
- SQLAlchemy писал в PG `ENUM` (миграции через Alembic).
- Можно сравнивать с литералом без явного каста.
"""
from enum import Enum


class UserRole(str, Enum):
    CUSTOMER = "customer"
    SELLER = "seller"
    ADMIN = "admin"


class Locale(str, Enum):
    UZ = "uz"
    RU = "ru"
    EN = "en"


class SellerVerification(str, Enum):
    UNVERIFIED = "unverified"
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class ProductStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    BLOCKED = "blocked"  # заблокирован модерацией


class OrderStatus(str, Enum):
    NEW = "new"
    ACCEPTED = "accepted"
    IN_PROGRESS = "in_progress"
    READY = "ready"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentProvider(str, Enum):
    PAYME = "payme"
    CLICK = "click"
    CASH = "cash"  # оплата при получении


class PaymentStatus(str, Enum):
    PENDING = "pending"
    AUTHORIZED = "authorized"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class NotificationType(str, Enum):
    ORDER_NEW = "order_new"
    ORDER_STATUS = "order_status"
    PAYMENT_PAID = "payment_paid"
    BROADCAST = "broadcast"
    STORY_NEW = "story_new"
    COMMENT = "comment"
    LIKE = "like"
    FOLLOW = "follow"
    SYSTEM = "system"


class BroadcastStatus(str, Enum):
    DRAFT = "draft"
    QUEUED = "queued"
    SENDING = "sending"
    SENT = "sent"
    CANCELLED = "cancelled"
    FAILED = "failed"


class BroadcastTargetType(str, Enum):
    FOLLOWERS = "followers"
    GROUP = "group"
    CITY = "city"
    REPEAT_BUYERS = "repeat_buyers"
    ALL_MY_CUSTOMERS = "all_my_customers"


class BroadcastCta(str, Enum):
    OPEN_PRODUCT = "open_product"
    OPEN_SELLER = "open_seller"
    ORDER_NOW = "order_now"
    EXTERNAL_URL = "external_url"
    NONE = "none"


class BroadcastDeliveryStatus(str, Enum):
    QUEUED = "queued"
    SENDING = "sending"
    DELIVERED = "delivered"
    READ = "read"
    CLICKED = "clicked"
    CONVERTED = "converted"
    FAILED = "failed"
    SKIPPED = "skipped"  # юзер отписался / opt-out


class SellerGroupPrivacy(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    INVITE_ONLY = "invite_only"


class GroupMemberSource(str, Enum):
    MANUAL = "manual"
    INVITE = "invite"
    IMPORTED = "imported"
    OPT_IN_FROM_ORDER = "opt_in_from_order"


class ContactImportStatus(str, Enum):
    PENDING = "pending"
    INVITED = "invited"
    JOINED = "joined"
    DECLINED = "declined"


class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class Currency(str, Enum):
    UZS = "UZS"
    USD = "USD"
