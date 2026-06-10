"""Recipe + RecipeLike + RecipeComment + RecipeSave.

Рецепт может публиковать любой пользователь (не только продавец) — это часть
комьюнити-стороны Begim. Структура поля `ingredients`/`steps` — JSON (список
объектов), чтобы фронт мог рендерить чек-листами без таблиц-связок.
"""

from typing import TYPE_CHECKING

from sqlalchemy import JSON, Enum as SAEnum, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, SoftDeleteMixin, TimestampMixin
from models.enums import DifficultyLevel

if TYPE_CHECKING:
    from models.city import City
    from models.user import User


class Recipe(Base, IdMixin, TimestampMixin, SoftDeleteMixin):
    __table_args__ = (
        Index("ftx_recipes_title_desc", "title", "description", mysql_prefix="FULLTEXT"),
        Index("ix_recipes_pub_city", "is_published", "city_id"),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4", "mysql_collate": "utf8mb4_unicode_ci"},
    )

    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    city_id: Mapped[int | None] = mapped_column(ForeignKey("citys.id", ondelete="SET NULL"), nullable=True, index=True)

    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    cook_time_min: Mapped[int | None] = mapped_column(nullable=True)
    servings: Mapped[int | None] = mapped_column(nullable=True)
    difficulty: Mapped[DifficultyLevel] = mapped_column(
        SAEnum(DifficultyLevel, name="difficulty_level", native_enum=False, length=10),
        default=DifficultyLevel.EASY,
        server_default=DifficultyLevel.EASY.value,
    )

    # [{name, qty, unit}, ...]
    ingredients: Mapped[list] = mapped_column(JSON, default=list)
    # [{order:1, text:"...", photo_url?:"..."}, ...]
    steps: Mapped[list] = mapped_column(JSON, default=list)
    # ["vegan","quick","ramazan"]
    tags: Mapped[list] = mapped_column(JSON, default=list)

    is_published: Mapped[bool] = mapped_column(default=True, server_default="1", index=True)
    likes_count: Mapped[int] = mapped_column(default=0, server_default="0")
    comments_count: Mapped[int] = mapped_column(default=0, server_default="0")
    saves_count: Mapped[int] = mapped_column(default=0, server_default="0")

    author: Mapped["User"] = relationship()
    city: Mapped["City | None"] = relationship()


class RecipeLike(Base, IdMixin, TimestampMixin):
    __table_args__ = (UniqueConstraint("recipe_id", "user_id", name="uq_recipe_likes_recipe_id_user_id"),)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)


class RecipeComment(Base, IdMixin, TimestampMixin, SoftDeleteMixin):
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    # Тред: parent_comment_id — null = корневой
    parent_comment_id: Mapped[int | None] = mapped_column(
        ForeignKey("recipe_comments.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    body: Mapped[str] = mapped_column(Text)


class RecipeSave(Base, IdMixin, TimestampMixin):
    """Сохранение рецепта в личную «кулинарную книгу»."""

    __table_args__ = (UniqueConstraint("recipe_id", "user_id", name="uq_recipe_saves_recipe_id_user_id"),)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
