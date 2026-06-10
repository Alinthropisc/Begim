from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Begim backend settings.

    Загружается из `.env` (override через переменные окружения).
    Все секреты обязательны в проде; в dev — задаются в `.env`.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # ----- App -----
    app_name: str = "Begim"
    app_env: Literal["dev", "staging", "prod", "test"] = "dev"
    debug: bool = False
    secret_key: str = Field(..., min_length=32, description="JWT/HMAC secret")
    api_prefix: str = "/api/v1"

    # ----- Database (MySQL 8) -----
    # Async driver: aiomysql. Для alembic используем pymysql (sync) — см. database/env.py.
    database_url: str = Field(
        default="mysql+aiomysql://begim:begim@localhost:3306/begim?charset=utf8mb4",
        description="SQLAlchemy async DSN (aiomysql)",
    )
    database_url_sync: str = Field(
        default="mysql+pymysql://begim:begim@localhost:3306/begim?charset=utf8mb4",
        description="Sync DSN для Alembic-миграций (pymysql)",
    )
    database_echo: bool = False
    # Под высокую нагрузку: держим пул всегда прогретым.
    database_pool_size: int = 20             # постоянных коннектов
    database_max_overflow: int = 40          # пиковая надстройка над size
    database_pool_recycle_sec: int = 1800    # переподключаем коннект раз в 30 мин (MySQL wait_timeout)
    database_pool_timeout_sec: int = 30      # сколько ждать свободного коннекта
    database_pool_pre_ping: bool = True      # SELECT 1 перед выдачей — защита от «MySQL gone away»
    database_warmup_on_start: bool = True    # открыть pool_size коннектов при старте

    # ----- Redis -----
    redis_url: str = "redis://localhost:6379/0"
    use_fakeredis: bool = False  # для dev на Windows / CI

    # ----- Telegram -----
    telegram_bot_token: str = Field(default="", description="@BegimBot token")
    telegram_bot_username: str = "BegimBot"
    telegram_api_server: str | None = None  # self-hosted Bot API (optional)
    telegram_api_local: bool = False
    # Глобальный канал-витрина Begim, куда публикуются все товары.
    global_channel_id: int | None = Field(
        default=None,
        description="ID канала @begim (отрицательное число для каналов)",
    )
    global_channel_username: str = "begim"
    # Webhook для бота (если пусто — long-polling)
    telegram_webhook_url: str | None = None
    telegram_webhook_secret: str | None = None

    # ----- Mini App -----
    mini_app_url: str = Field(
        default="https://app.begim.uz",
        description="Public URL Mini App (для кнопок в канале и боте)",
    )

    # ----- Auth -----
    jwt_algorithm: str = "HS256"
    jwt_access_ttl_sec: int = 60 * 60 * 24 * 7   # 7 дней
    jwt_refresh_ttl_sec: int = 60 * 60 * 24 * 30  # 30 дней
    # initData считается валидным в течение этого окна (сек).
    telegram_init_data_max_age_sec: int = 60 * 60 * 24

    # ----- Payments -----
    payme_merchant_id: str | None = None
    payme_secret_key: str | None = None
    payme_endpoint: str = "https://checkout.paycom.uz"

    click_merchant_id: str | None = None
    click_service_id: str | None = None
    click_secret_key: str | None = None
    click_endpoint: str = "https://api.click.uz/v2"

    # Комиссия платформы (basis points, 100 = 1%). 0 = выключено.
    platform_commission_bps: int = 0

    # ----- Storage -----
    storage_root: Path = PROJECT_ROOT / "storage"
    media_url_prefix: str = "/media"
    max_upload_size_mb: int = 25

    # ----- Rate limits -----
    rate_limit_global_rps: int = 100
    rate_limit_user_per_minute: int = 60

    # ----- Stories -----
    story_ttl_hours: int = 24
    story_max_per_day: int = 20

    # ----- i18n -----
    default_locale: Literal["uz", "ru", "en"] = "uz"
    supported_locales: tuple[str, ...] = ("uz", "ru", "en")

    # ----- Worker (arq) -----
    arq_queue_name: str = "begim:queue"
    arq_max_jobs: int = 20

    # ----- Observability -----
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    log_json: bool = False

    # ----- Bootstrap admins -----
    # Список tg_id, которым ставится role=admin при первом входе. Дальше — через БД.
    bootstrap_admin_tg_ids: list[int] = Field(default_factory=list)

    @property
    def is_prod(self) -> bool:
        return self.app_env == "prod"

    @property
    def is_test(self) -> bool:
        return self.app_env == "test"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
