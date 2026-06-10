# DONE — состояние Begim backend на конец сессии

> Дата: 2026-06-07. Стек: Python 3.13 + Litestar + aiogram 3 + SQLAlchemy 2.0 async +
> aiomysql (MySQL 8) + arq + Redis + Granian + uvloop + orjson + ruff + uv.

## 1. Фундамент

- [x] Очищены остатки старого шаблона (MediaFlow / ads / youtube / gallery-dl).
- [x] `app/config.py` под Begim: TG бот, Mini App, Payme/Click, города, Stories TTL,
      Loyalty opt-in, пул БД, JWT TTL.
- [x] `.env.example` под новый конфиг.
- [x] `pyproject.toml`: убраны `gallery-dl`, `aiomysql старая`, `brotli`, `passlib`,
      `apscheduler`; добавлены `aiomysql`, `pymysql`, `uvloop`, `orjson`.
- [x] `main.py` с активацией uvloop до запуска Granian.

## 2. Доменная модель (28 ORM моделей)

`models/__init__.py` регистрирует все таблицы в `Base.metadata` — Alembic
autogenerate их видит.

| Сущность                | Файл                          | Особое                                                  |
|-------------------------|-------------------------------|---------------------------------------------------------|
| Base, mixins, naming    | `models/base.py`              | BigInt PK, TIMESTAMPTZ, soft-delete                     |
| Enums                   | `models/enums.py`             | 16 доменных enum'ов                                     |
| City                    | `models/city.py`              | slug + uz/ru/en, is_active                              |
| User                    | `models/user.py`              | tg_id UQ, phone_hash, role, locale, marketing_opt_in    |
| SellerProfile           | `models/seller_profile.py`    | brand_name, slug UQ, verification, денорм. метрики      |
| Category                | `models/category.py`          | parent_id (двухуровневое дерево)                        |
| Product                 | `models/product.py`           | JSON tags/attributes, FULLTEXT(title,desc), InnoDB+utf8mb4 |
| ProductPhoto            | `models/product_photo.py`     | url + tg_file_id (переиспользование TG-кеша)            |
| Story + StoryView       | `models/story.py`             | expires_at, UQ(story,viewer)                            |
| Recipe + Like/Comment/Save | `models/recipe.py`         | JSON ingredients/steps, FULLTEXT, любой юзер            |
| CommunityPost + Like/Comment | `models/community.py`    | JSON photos/tags                                        |
| Follow                  | `models/follow.py`            | UQ(follower, seller)                                    |
| Order + Item + StatusLog| `models/order.py`             | *_minor int, snapshot title/price, source_broadcast_id  |
| Payment                 | `models/payment.py`           | provider-агностично, raw_payload JSON                   |
| Review                  | `models/review.py`            | UQ(order), CK rating 1..5                               |
| ChannelPost             | `models/channel_post.py`      | product → (channel, message_id)                         |
| Notification            | `models/notification.py`      | type, payload JSON, read_at                             |
| SellerGroup + Member    | `models/seller_group.py`      | invite_slug UQ, opt_in_marketing обязателен             |
| SellerContact           | `models/seller_contact.py`    | phone_hash (открытый телефон не храним)                 |
| Broadcast + Delivery    | `models/broadcast.py`         | UQ(broadcast,user), index(broadcast,status)             |

## 3. Async-инфра БД

- [x] `database/session.py`:
  - `init_db()` создаёт engine с `pool_size=20`, `max_overflow=40`,
    `pool_pre_ping=True`, `pool_use_lifo=True`.
  - `warmup_pool()` параллельно открывает все 20 коннектов на старте.
  - `_pool_keepalive_loop()` — `SELECT 1` каждые 30с.
  - **`db_session()` — единственный санкционированный async-CM** (автокоммит/rollback/close).
  - orjson сериализация JSON-колонок.
- [x] `database/env.py` — Alembic подключён к `Base.metadata` через `models/__init__`,
      использует SYNC-DSN (pymysql), `compare_type=True`, `compare_server_default=True`.

## 4. Repositories (с UoW)

- `BaseRepository[T]` — generic CRUD + фильтры через `__operator` (`__in`, `__gt`, …).
- `UnitOfWork` — обёртка над `db_session()` с ленивыми property:
  - `users`, `cities`, `categories`, `sellers`, `products`, `orders`, `payments`,
    `reviews`, `stories`, `story_views`, `recipes`, `community_posts`, `follows`,
    `notifications`, `seller_groups`, `group_members`, `contacts`, `broadcasts`,
    `deliveries`.
- Специальные:
  - `UserRepository.upsert_from_tg()` — на повторном входе обновляет только TG-поля.
  - `ProductRepository` + **Specification-паттерн**: `PublishedOnly | InCity | InCategory
    | BySeller | PriceRange | FullTextSearch` через `&`. Sort через таблицу стратегий.
  - `OrderRepository.list_for_buyer/list_for_seller`.
  - `SellerProfileRepository.slug_exists`.
  - `StoryRepository.feed_for_user` (подписки + верифицированные в городе).
  - `BroadcastDeliveryRepository`, `BroadcastRepository.list_for_seller`.

## 5. Services (use cases)

### 5.1 Security
- `services/security/initdata.py` — HMAC валидация Telegram initData по спеке,
  проверка `auth_date` против `max_age_sec`.
- `services/security/jwt.py` — `issue_token()` / `decode_token()` (`access`+`refresh`,
  `kind`, `jti`, `exp`).
- `services/security/phone.py` — `normalize_e164` + `hash_phone(sha256(salt+e164))`.

### 5.2 Auth
- `services/auth.py` — `AuthService`:
  - `login_via_init_data` — upsert User, выдача пары токенов, `jti` в Redis.
  - `refresh` — **rotate-стратегия**: старый jti удаляется, выдаётся новый.
  - `logout` — удаляет jti из Redis.

### 5.3 Каталог
- `services/sellers.py` — `SellerService.become_seller / update_my / get_public`,
  slug-генератор (NFKD + транслит RU/UZ, коллизии → `slug-2`, `slug-3`).
- `services/products.py` — `ProductService`:
  - `list_public` — Specification + sort + лимит ≤60.
  - `create_draft / update / publish / archive / add_photo`.
  - `publish()` после успешного COMMIT энкьюит arq-job (никаких событий до коммита).
  - `_load_owned()` проверяет `seller.user_id == current_user.id`.
  - `_assert_publishable()` — минимум title + ≥1 фото.

### 5.4 Заказы
- `services/orders.py` — `OrderService`:
  - `create` — snapshot title/price/options, валидация **один заказ = один продавец**,
    идемпотентность по `(buyer, idempotency_key)` через Redis (TTL 24ч).
  - `transition` — таблица переходов `TRANSITIONS[role][from] = {allowed_to}`,
    append-only `OrderStatusLog`, событие `order_status_changed`.
  - `cancel`, `get`, `list_my_buyer`, `list_my_seller`.

### 5.5 Платежи
- `services/payments/base.py` — `PaymentProvider` abstract Strategy +
  `CheckoutLink` + `WebhookOutcome`.
- `services/payments/cash.py` — оплата при получении (без вебхуков).
- `services/payments/payme.py` — checkout-url base64(`m;ac.order_id;a`),
  Basic-auth вебхука, JSON-RPC методы: `CheckPerformTransaction`,
  `CreateTransaction`, `PerformTransaction`, `CancelTransaction`, `CheckTransaction`.
  Ошибки `-31001/-31003/-31008/-31050` по спеке.
- `services/payments/click.py` — checkout-url `my.click.uz/services/pay`,
  два callback'а (`action=0` Prepare, `action=1` Complete) с md5-валидацией
  `sign_string`.
- `services/payments/registry.py` — `get_provider(enum)`.
- `services/payment_service.py` — оркестратор:
  - `create_payment` — один активный Payment на Order (повторно отдаёт checkout).
  - `handle_webhook` — verify + delegate + apply (paid → Order ACCEPTED auto;
    refunded → Order REFUNDED).
  - Событие `payment_paid` в arq.

### 5.6 Отзывы
- `services/reviews.py` — **только покупатель** + **только Order=DELIVERED** +
  UQ(order). После create — денормализуем `SellerProfile.rating_avg/reviews_count`.

### 5.7 Социал
- `services/social.py`:
  - `StoryService` — create (только верифицированные продавцы), feed, view, delete.
  - `RecipeService` — list/get/create + toggle_like / toggle_save.
  - `CommunityService` — create / feed / toggle_like.
  - `FollowService` — follow/unfollow с инкрементом `followers_count`.
  - `NotificationService` — list / mark_read / mark_all_read.

### 5.8 Loyalty (CRM + Lazy Data Stream)
- `services/loyalty.py`:
  - `SellerGroupService` — create, list_my, join_by_slug (opt-in by design).
  - `ContactsService` — `import_contacts` хэширует телефоны и матчит с
    существующими User по `phone_hash`. Открытый номер не сохраняется.
  - `BroadcastService` + **Strategy** для таргета:
    - `FollowersTarget` (подписчики с marketing_opt_in),
    - `GroupTarget` (члены группы с opt-in),
    - `RepeatBuyersTarget` (≥2 заказа),
    - `AllMyCustomersTarget` (любые покупатели с opt-in).
  - `materialize` — `INSERT IGNORE` чанками по 500, без выгрузки аудитории в память.
  - `send()` после материализации энкьюит `dispatch_broadcast_chunk`.
  - `track_click()` — атрибуция переходов из deep-link.

## 6. HTTP API

**Базовый префикс `/api/v1`. JWT в `Authorization: Bearer <access_token>`.**

Полный список эндпоинтов — в `API.md`. Готовы:

- Auth: `/auth/telegram | refresh | logout`
- Me: `GET/PATCH /me`
- Meta: `GET /cities`, `GET /categories`
- Sellers: `POST /sellers`, `PATCH /sellers/me`, `GET /sellers/{id_or_slug}`,
  `GET /sellers/{id}/reviews`, `POST /sellers/{id}/follow` / `DELETE`
- Products: `GET /products`, `GET /products/{id}`, `POST/PATCH /products[/{id}]`,
  `POST /products/{id}/publish | archive`, `POST /products/{id}/photos`
- Orders: `POST /orders`, `GET /orders/{id}`, `POST /orders/{id}/transition | cancel`,
  `GET /me/orders`, `GET /seller/orders`
- Payments: `POST /orders/{id}/payments`, `GET /payments/{id}`,
  `POST /webhooks/payme`, `POST /webhooks/click`
- Reviews: `POST /orders/{id}/review`, `POST /reviews/{id}/reply`
- Stories: `GET /stories/feed`, `POST /stories`, `POST /stories/{id}/view`,
  `DELETE /stories/{id}`
- Recipes: `GET/POST /recipes[/{id}]`, `POST /recipes/{id}/like | save`
- Community: `GET /feed`, `POST /posts`, `POST /posts/{id}/like`
- Notifications: `GET /me/notifications`,
  `POST /me/notifications/{id}/read`, `POST /me/notifications/read-all`
- Loyalty groups: `GET/POST /seller/groups`, `POST /groups/join/{invite_slug}`
- Contacts: `POST /seller/contacts/import`, `GET /seller/contacts`
- Broadcasts: `GET/POST /seller/broadcasts`, `POST /broadcasts/{id}/send | cancel`,
  `POST /broadcasts/{id}/track/click`
- Admin: `/admin/dashboard | sellers | sellers/{id}/verify|reject |
  products/{id}/block|unblock | cities | categories`

## 7. Bot

- `bot/dispatcher.py` + `bot/handlers/start.py` — `/start` с парсингом deep-link:
  - `s_<slug>` → профиль продавца
  - `p_<id>` / `p_<id>_b_<bid>` → товар (+ broadcast атрибуция)
  - `o_<id>` → заказ
  - `join_<slug>` → клуб клиентов
- В lifespan `app/lifecycle.py` бот поднимается, polling запускается в фоне
  (`_start_bot_polling`), graceful shutdown.

## 8. Worker (arq)

`worker/main.py:WorkerSettings`, файл `worker/tasks.py` + `worker/broadcast_dispatcher.py`.

| Задача                       | Что делает                                                          |
|------------------------------|---------------------------------------------------------------------|
| `publish_to_channel`         | Идемпотентная публикация Product в глобальный канал @begim          |
| `unpublish_from_channel`     | Удаление поста при архивации                                        |
| `order_created`              | Уведомления продавцу (in-app + TG-DM) и покупателю (in-app)         |
| `order_status_changed`       | In-app + TG-DM покупателю                                           |
| `payment_paid`               | Уведомление покупателю об успешной оплате                           |
| `dispatch_broadcast_chunk`   | **Lazy Data Stream**: 25 строк `FOR UPDATE SKIP LOCKED`, send, статусы, пауза 1с, рекуррент |

## 9. Документация

- `README.md` — стек, установка, MySQL, миграции, env, структура, команды.
- `API.md` — все эндпоинты с примерами и форматом ошибок.
- `API_DOCS.Domain.md` — глоссарий доменных сущностей, инварианты, паттерны,
  Lazy Data Stream-схема, чек-лист «вернулся через неделю».
- `scripts/seed.py` — Коканд (active) + 4 inactive города + дерево категорий
  (Торты / Выпечка / Национальные сладости / Хлеб / Диетическое).

## 10. Инфра-инварианты, которые мы держим

1. Деньги — только `*_minor` (int, тийины).
2. `OrderStatusLog` append-only.
3. Broadcast → только `opt_in_marketing=true` (фильтр на уровне SQL).
4. `Order.transition()` — единственная точка смены статуса.
5. `User.tg_id` уникален; повторный логин = тот же user.
6. Soft-delete только на сущностях, где есть `SoftDeleteMixin`. Платежи/заказы
   не удаляются никогда — это аудит.
7. `ChannelPost` — единственный источник правды для опубликованных постов.
8. Контакты — только `phone_hash`, открытый телефон не пишем.
9. Один Order = один Seller.
10. Один Review = один Order = один buyer = только после DELIVERED.

---

## 11. Сессия 2026-06-08 — поднят и провалидирован локально

**Инфра подготовлена:**
- `.env` заполнен (БД `begim` на MySQL 8.0.46 через root, Redis `redis://localhost:6379/0`,
  реальный `TELEGRAM_BOT_TOKEN` для `@Beegimbot`, `GLOBAL_CHANNEL_ID`).
- БД создана, прогнаны `alembic revision --autogenerate` + `upgrade head` → **29 таблиц**.
- Сидер `scripts.seed` → **5 городов** (Коканд active) + **11 категорий** (двухуровневое дерево).
- Redis поднят, `PONG`.

**Провалидировано (Litestar TestClient, реальный MySQL):** `create_app()` строит **71 route**;
`GET /health`, `/api/v1/ping`, `/api/v1/cities`, `/api/v1/categories` → все `200` с данными.
Бот `@Beegimbot` подключился и ушёл в polling.

**Починены баги (без них бэк не стартовал):**
1. `models/*`: 9 булевых `server_default="true"/"false"` → `"1"/"0"` — MySQL tinyint не
   принимает строку (ошибка 1067), миграция падала на первой таблице.
2. 4 хендлера `@post(status_code=204)` возвращали `Response` → `-> None`
   (`auth.logout`, `social.view`, `social.read_one`, `loyalty.click`) — Litestar
   не регистрировал приложение (ImproperlyConfigured 204).
3. `repositories/category.py:list_tree` — async lazy-load `child.children`
   (MissingGreenlet) на `/categories`; добавлен второй уровень `selectinload`.
4. App-factory: убрана сборка приложения на уровне импорта (`app = create_app()`),
   `main.py`/granian переведены на `app.lifecycle:create_app` + `factory=True`;
   убран `from __future__ import annotations` в `auth/social/loyalty` контроллерах
   (ломал резолв `-> None` в granian-воркере).

## 12. Сессия 2026-06-08 (под фронты)

- [x] **CORS** добавлен в `app/lifecycle.py` (`CORSConfig(allow_origins=["*"]`,
      методы/заголовки) — фронты ходят с :5173/:5174/туннеля. Auth по Bearer, не
      куки, поэтому wildcard безопасен. **Для prod сузить до доменов.**
- [x] **Сидер товаров** (`scripts/seed.py`): 3 продавца (User+SellerProfile
      verified) + 7 опубликованных товаров с фото. Идемпотентно.
- [x] **ProductOut**: добавлены `seller_name`, `seller_avatar_url`, `rating`,
      `reviews_count` через Pydantic `AliasPath("seller", ...)`; `list_by_spec`
      теперь eager-load'ит `Product.seller` (без N+1/MissingGreenlet). Проверено:
      `/products` отдаёт `seller_name='Malika'`.
- [ ] **Известный шум**: loguru пишет `KeyError: 'name'` на каждый INFO — баг
      формат-строки логгера (не фатально, перехватывается). Починить формат.
- [ ] `MINI_APP_URL` в `.env` временно указывает на cloudflared-туннель
      (бэкап оригинала — `.env.bak.session`). Вернуть прод-URL при деплое.
