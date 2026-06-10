"""Alembic env.

Использует SYNC-DSN (pymysql) — миграции запускаются синхронно. Это нормальный
паттерн даже для async-проектов: Alembic + asyncio = больше боли, чем пользы.
DSN берётся из `app.config.settings.database_url_sync`.

`target_metadata = Base.metadata` — autogenerate видит все модели, потому что
их регистрирует `models/__init__.py`.
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Подтягиваем настройки и регистрируем все модели в Base.metadata.
from app.config import settings
import models
from models.base import Base

config = context.config

# Подменяем URL из alembic.ini на тот, что в .env (sync-DSN, pymysql).
config.set_main_option("sqlalchemy.url", settings.database_url_sync)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
