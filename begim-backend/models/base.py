"""SQLAlchemy declarative base, naming conventions, common mixins.

Принципы:
- Все модели наследуют `Base`, имена таблиц генерируются автоматически (snake_case + 's').
- Большой PK — `BigInteger` (масштаб). UUID только там, где это даёт реальную ценность
  (внешние webhook'и, токены, deep-link слаги).
- Все timestamps — TIMESTAMPTZ.
- Мягкое удаление — через `SoftDeleteMixin` только там, где нужна аудитория/история;
  модели событий не удаляются никогда.
"""
from datetime import datetime
from typing import Any

from sqlalchemy import BigInteger, DateTime, MetaData, func
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column


_NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """Корневой Declarative-класс. Все ORM-модели наследуются от него."""

    metadata = MetaData(naming_convention=_NAMING_CONVENTION)

    @declared_attr.directive
    def __tablename__(cls) -> str:  # noqa: N805
        # CamelCase → snake_case + 's'
        name = cls.__name__
        snake = "".join(f"_{c.lower()}" if c.isupper() else c for c in name).lstrip("_")
        return snake + "s"

    def to_dict(self) -> dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    def __repr__(self) -> str:
        pk = getattr(self, "id", None)
        return f"<{self.__class__.__name__}(id={pk})>"


class IdMixin:
    """BigInteger autoincrement PK. Дефолт для горячих таблиц."""

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)


class TimestampMixin:
    """`created_at`, `updated_at` — TIMESTAMPTZ, сервер-сайд defaults."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class SoftDeleteMixin:
    """Мягкое удаление. Сервисы должны фильтровать `is_deleted=False`."""

    is_deleted: Mapped[bool] = mapped_column(default=False, server_default="0", index=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
