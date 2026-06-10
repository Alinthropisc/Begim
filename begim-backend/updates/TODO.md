# TODO — что осталось доделать

> Список упорядочен по приоритету. Параграф «Прежде чем поедет фронт» — самое
> важное. Остальное можно делать параллельно с фронтом или после MVP.

---

## ✅ СДЕЛАНО 2026-06-08 (см. DONE.md §11)

Пункты 1–3 ниже **выполнены**: `.env` заполнен, БД `begim` создана, миграции прогнаны
(29 таблиц), сидер отработал (5 городов, 11 категорий), Redis поднят. Эндпоинты
`/health`, `/api/v1/ping`, `/api/v1/cities`, `/api/v1/categories` отдают `200`
(проверено Litestar TestClient на реальном MySQL). Бот `@Beegimbot` ушёл в polling.
По ходу починены 4 бага (булевы server_default, 204-хендлеры, lazy-load /categories,
app-factory). Осталось подтвердить **живой** `uv run python main.py` в обычном терминале.

Блок ниже оставлен как исторический рецепт (что именно делалось).

## 🔴 Прежде чем поедет фронт (5–30 мин на каждое)

### 1. Прогнать миграцию и сидер
```bash
cd begim-backend
uv sync
cp .env.example .env
# Заполни SECRET_KEY (≥32 символа), DATABASE_URL, DATABASE_URL_SYNC, REDIS_URL,
# TELEGRAM_BOT_TOKEN, MINI_APP_URL.

# MySQL:
# CREATE DATABASE begim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# CREATE USER 'begim'@'%' IDENTIFIED BY 'begim';
# GRANT ALL ON begim.* TO 'begim'@'%'; FLUSH PRIVILEGES;

uv run alembic revision --autogenerate -m "init"
uv run alembic upgrade head
uv run python -m scripts.seed
```
Если автоген упадёт — пришли ошибку, чиню сразу. Самые вероятные мелочи:
- проверить, что `models/__init__.py` действительно импортируется (alembic env это делает),
- MySQL версия 8+ для нативного JSON,
- если коллация default = utf8mb4_0900_ai_ci — норм, FK будут совместимы.

### 2. Запустить API + worker
```bash
uv run python main.py
# В другом терминале:
uv run arq worker.main.WorkerSettings
```

### 3. Smoke-test через curl
```bash
curl localhost:8000/health
curl localhost:8000/api/v1/ping
curl localhost:8000/api/v1/cities
curl localhost:8000/api/v1/categories
```
Если падает — `loguru` всё подробно пишет в `storage/logs/`.

---

## 🟡 Что надо допилить до запуска MVP (полдня-день)

### 4. Загрузка фото (multipart upload)
**Сейчас:** `POST /products/{id}/photos` принимает уже-готовый `url`. Нет
пайплайна аплоада файла.

**Что сделать:**
- `POST /api/v1/upload/photo` (multipart/form-data): принимает файл, сохраняет
  в `storage/uploads/<yyyy>/<mm>/<dd>/<uuid>.<ext>`, валидирует mime + размер
  (≤ `settings.max_upload_size_mb`), возвращает `{url}`.
- Создать `services/uploads.py` с проверкой типов (`image/jpeg`, `image/png`,
  `image/webp`).
- Возможно — на лету уменьшать через Pillow (для thumb).
- Тот же эндпоинт переиспользовать для: Stories media, Recipe cover/steps,
  CommunityPost photos, SellerProfile avatar/cover, Broadcast media.

**Альтернатива:** прямо сейчас загружать через бота (продавец шлёт фото в DM,
бот возвращает `tg_file_id` + url из `getFile`) — это даже быстрее в проде.

### 5. Channel post с фото
**Сейчас:** `worker/tasks.py:publish_to_channel` шлёт text-only.

**Что сделать:**
- Если у продукта есть фото — `bot.send_photo(photo=tg_file_id или URL, caption=...)`.
- Если фото несколько (≥2) — `send_media_group([InputMediaPhoto])`.
- Учесть лимит caption ≤1024 символов (длинное описание усекать с «…»).

### 6. Order media для broadcast
**Сейчас:** `dispatch_broadcast_chunk` шлёт text-only.

**Что сделать:** если `Broadcast.media` непуст — отправлять `send_photo` /
`send_media_group` с тем же `InlineKeyboardMarkup`.

### 7. Soft-permission приглашение в клуб
**Сейчас:** `ContactsService.import_contacts` ставит matched/unmatched, но
кнопки «пригласить в клуб» нет.

**Что сделать:**
- `POST /api/v1/seller/contacts/{id}/invite`:
  - matched → arq-таска `send_join_offer(contact_id)`: бот шлёт matched-юзеру
    DM «<brand_name> добавил вас в клуб; хотите получать новинки? [✅ Да] [Нет]»
    с callback кнопками. На «Да» → создаём `SellerGroupMember(opt_in=True)`.
  - unmatched → возвращаем deep-link `t.me/BegimBot?start=join_<token>`, который
    продавец сам перешлёт в WhatsApp/SMS.
- Добавить handler callback'а `accept_join_<contact_id>` в `bot/handlers/`.

### 8. Phone-onboarding для покупателей
**Сейчас:** `User.phone_hash` пуст у всех. Без него матч импорта контактов
бесполезен.

**Что сделать:**
- `POST /api/v1/me/phone` принимает `{phone: "+998..."}` → `hash_phone` →
  `user.phone_hash = ...`.
- В Mini App — экран «Добавить телефон, чтобы продавцы могли пригласить вас в
  клуб» (один раз).
- Опционально OTP-подтверждение (eskiz.uz / playmobile / Twilio) — для MVP можно
  пропустить, потом добавить.

### 9. Telegram webhook вместо polling (для prod)
**Сейчас:** lifespan стартует `dp.start_polling(bot)` в фоне. Для prod —
неудобно (бот «спит» если процесс рестартанул, лишние round-trip).

**Что сделать:**
- Если `settings.telegram_webhook_url` задан — НЕ запускать polling, а:
  - На startup делать `bot.set_webhook(url=..., secret_token=...)`.
  - Добавить эндпоинт `POST /api/v1/webhooks/telegram` (валидация
    `X-Telegram-Bot-Api-Secret-Token` = `settings.telegram_webhook_secret`),
    передающий update в `dp.feed_update(bot, update)`.

### 10. Refresh-token rotation edge case
**Сейчас:** при `refresh()` старый jti удаляется в Redis. Если клиент послал
старый refresh после rotate — он не пройдёт. Это правильно. Но фронт должен:
- хранить refresh строго в одном месте,
- при 401 на refresh → редиректить на логин.
Документировать в `API.md`.

---

## 🟢 Полезное, но не блокирующее (постепенно)

### 11. Тесты
**Минимум на MVP:**
- `tests/test_initdata.py` — валидный/невалидный/expired initData.
- `tests/test_jwt.py` — issue/decode/rotate.
- `tests/test_order_state_machine.py` — все разрешённые/запрещённые переходы.
- `tests/test_payme_jsonrpc.py` — `CheckPerformTransaction` happy/wrong_amount.
- `tests/test_broadcast_lazy_stream.py` — materialize + dispatcher с моком бота.

`pytest-asyncio` уже в dev-группе. БД — `aiosqlite` (но тогда не FULLTEXT —
тесты только на логику сервисов).

### 12. Sandbox-интеграция Payme/Click
- Получить тестовые мерчант-кредитки.
- Прогнать сценарий Order → Payment → checkout → webhook → PAID.
- Payme `CancelTransaction` для возврата средств.

### 13. Webhook бота для платежей
- Сейчас вебхуки идут на `/api/v1/webhooks/payme|click`. Это правильно. Убедиться,
  что Granian/обратный прокси отдаёт `X-Forwarded-For` (для логов).
- Добавить rate-limit на сами вебхуки (Payme/Click отправляют ретраи —
  обработка должна быть идемпотентной, что уже сделано через `external_id`).

### 14. Rate-limit
- Простейший — Redis-counter на `(ip, endpoint, minute_bucket)` для:
  - `/auth/telegram` — 5/min
  - `/products` listing — 60/min
  - `/orders` POST — 10/min
- Использовать `redis.incr` + `expire`.

### 15. Healthcheck с проверкой зависимостей
- Сейчас `/health` отдаёт только `{status:"ok"}`. Сделать `/health/ready`:
  `SELECT 1` в БД + `PING` в Redis + `bot.get_me()` (cached).

### 16. Логи и observability
- Уже есть loguru. Добавить:
  - `request_id` в middleware (UUID на запрос, в logger.bind).
  - JSON log mode в проде (`settings.log_json=true`).
  - Sentry SDK (опционально).

### 17. Photo upload через Telegram
**Альтернатива п.4:** удобный паттерн для продавца — кинуть фото боту в DM.
- Handler `@router.message(F.photo)`:
  - Если у user есть незаполненный draft Product — добавляем фото к нему
    (берём `largest = message.photo[-1].file_id`).
  - Иначе — добавляем в «корзину медиа» и предлагаем выбрать продукт.

### 18. Pagination cursor-based
**Сейчас:** offset/limit. Для больших таблиц (после 100k записей) — медленно.
- Перевести `/products`, `/recipes`, `/feed`, `/me/orders` на cursor `(?after=<id>)`.

### 19. Recipe / Post comments endpoints
**Модели уже есть** (`RecipeComment`, `PostComment`), но не эндпоинтов:
- `POST /api/v1/recipes/{id}/comments`
- `GET /api/v1/recipes/{id}/comments`
- `POST /api/v1/posts/{id}/comments`

### 20. Story comments / replies
- TG-style ответ на сторис в DM продавцу → сохранять как `Notification(type=COMMENT)`.

### 21. Conversion tracking для broadcasts
- В `OrderService.create` уже принимаем `source_broadcast_id`.
- В `Broadcast` есть `converted_count`. Триггерить:
  при `Order.create(source_broadcast_id=X)` → инкрементить `broadcast.converted_count`
  и помечать `BroadcastDelivery(broadcast_id=X, user_id=buyer_id).status=CONVERTED`.
  Сейчас этого нет.

### 22. Аналитика для продавца
- `GET /api/v1/seller/analytics?period=7d`:
  - Заказы за период, конверсия из канала, конверсия из broadcasts, выручка,
    топ-товары.
- Запросы агрегатные, можно решить одной view + кэшем 5 мин в Redis.

### 23. Dishka (контейнер DI)
**Когда стоит делать:** когда в боте появится ≥5 обработчиков, которые шарят
сервисы с API. Сейчас Litestar `Provide()` хватает.

### 24. Геокодирование адреса
- Сейчас `Order.delivery_lat/lon` опциональны. На фронте — карта Mini App,
  координаты шлёт сам.
- Для города/района добавить enum под Кокандские районы (Кокон-1, Кокон-2 …) —
  если важна логистика доставки.

---

## 🧹 Технический долг и приборка

- В `repositories/base_repository.py` метод `update_many` использует
  `_apply_filters` на `update()` — нужно проверить, что в SQLAlchemy 2.0 это
  работает с фильтрами через `__operator`. На простых случаях работает; на
  сложных может потребоваться `where(...)` явно.
- `payment_service.py._transition_order` пишет лог напрямую, обходя
  `OrderService.transition()`. Сейчас это нормально — это системное действие
  без проверки прав. Но удобно было бы вынести общий хелпер.
- `worker/broadcast_dispatcher.py` — используем `text("SELECT ... FOR UPDATE
  SKIP LOCKED")` напрямую, потому что у SQLAlchemy с `aiomysql` есть нюансы с
  `with_for_update(skip_locked=True)`. Если в проде заметим warning'и — переписать
  на ORM-вариант.
- `services/social.py:StoryService.mark_view` ловит `IntegrityError` для
  идемпотентности — на больших нагрузках лучше переписать на
  `INSERT IGNORE` (МySQL) одним запросом.

---

## 🎯 Что строить дальше после MVP

1. **Ranking ленты `/feed`** — простая модель: свежесть × city_match × follower_signal × likes.
2. **Серверные push-уведомления** — Mini App может опрашивать `/me/notifications`,
   но push через TG-DM покрывает 80% случаев.
3. **Купоны / промокоды** — отдельная сущность `Promo`, поле `Order.discount_minor`.
4. **Доставка в реальном времени** — отдельный курьер (`Courier` модель) + Telegram-бот для них.
5. **Multi-seller cart** — выпустить, когда продавцов станет ≥50.
6. **Web-witrina** для покупателей без Telegram — отдельный SSR.

---

## ❓ Если что-то сломается

1. **`alembic` упал на autogenerate** — пришли точный stderr; самые вероятные
   причины:
   - неверный URL → проверь `DATABASE_URL_SYNC` (`mysql+pymysql://...`),
   - MySQL <8 → JSON не поддерживается,
   - конфликт имени таблицы (мы используем плюрализацию +s, поэтому имена
     `citys`, `categorys` — это намеренно).
2. **`uv run python main.py` падает на старте** — обычно:
   - `SECRET_KEY` короче 32 символов → pydantic ругается,
   - Redis недоступен → `RedisError` в `_init_redis`,
   - MySQL недоступен → `aiomysql` timeout → проверь, что сервис запущен.
3. **arq worker не подбирает задачи** — `redis_settings` должен указывать в тот
   же Redis, что и API; проверь `arq_queue_name=settings.arq_queue_name`.
4. **Бот не отвечает на /start** — `TELEGRAM_BOT_TOKEN` пуст или невалиден.
   Логи покажут «Bot init failed».

---

Завтра — фронт. README + API.md + API_DOCS.Domain.md дают всё, что нужно для
интеграции. Этот файл и `DONE.md` — точка возврата для бэка.
