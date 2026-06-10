"""arq WorkerSettings.

Запуск:
    uv run arq worker.main.WorkerSettings
"""

from __future__ import annotations

from arq.connections import RedisSettings

from app.config import settings
from worker.broadcast_dispatcher import dispatch_broadcast_chunk
from worker.tasks import (
    on_shutdown,
    on_startup,
    order_created,
    order_status_changed,
    payment_paid,
    publish_to_channel,
    unpublish_from_channel,
)


class WorkerSettings:
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
    queue_name = settings.arq_queue_name
    max_jobs = settings.arq_max_jobs
    keep_result = 3600  # 1ч хранения результатов

    functions = [
        publish_to_channel,
        unpublish_from_channel,
        order_created,
        order_status_changed,
        payment_paid,
        dispatch_broadcast_chunk,
    ]

    on_startup = on_startup
    on_shutdown = on_shutdown
