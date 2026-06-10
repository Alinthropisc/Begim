# API_DOCS — Domain

> Контекст-карта для быстрого возвращения после переключения IDE/проекта.
> Если внёс изменение в домен — обнови этот файл, иначе он отравит будущий контекст.

---

## 1. Что это за продукт

**Begim** — маркетплейс домашних пекарей. Старт — Коканд, потом Наманган,
Андижан и далее по областям. Покупатель открывает Telegram Mini App, смотрит
сторис/ленту/каталог, покупает торт у соседки через TG. Все товары
автоматически попадают в **глобальный TG-канал @begim**. Продавец может
вести **свой клуб клиентов** и слать им targeted-рассылки (Lazy Data Stream).

## 2. Гранулярная структура

### 2.1 Языки и слои

```
HTTP (Litestar)
  → Schema (Pydantic DTO)                  — границы API
  → Service (use case)                     — бизнес-логика
  → Repository (BaseRepository[T])         — доступ к данным
  → ORM (SQLAlchemy 2.0)                   — БД (MySQL 8)
```

Контроллер **никогда** не обращается к репозиториям напрямую — только через сервис.
Сервис **никогда** не знает про HTTP — никаких `Request`/`Response` внутри.

### 2.2 Транзакции — Unit of Work

Каждый use case = одна транзакция. Точка входа — `database.db_session()`:

```python
async with db_session() as session:
    # session.commit() автоматически на выходе из блока
    repo = ProductRepository(session)
    await ProductService(repo, ...).publish(product_id, actor)
```

### 2.3 События — лёгкий event-bus поверх arq

Доменные события не пушим в HTTP-обработчике, а кладём в arq-очередь:

| Событие                  | Подписчики                                             |
|--------------------------|--------------------------------------------------------|
| `ProductPublished`       | publish_to_channel, notify_followers                   |
| `OrderCreated`           | notify_seller_dm, notify_buyer_receipt, track_broadcast_conversion |
| `OrderStatusChanged`     | notify_buyer, notify_seller                            |
| `PaymentSucceeded`       | OrderService.mark_paid, notify_buyer                   |
| `StoryCreated`           | notify_followers                                       |
| `BroadcastQueued`        | dispatcher loop                                        |

Это даёт **расширяемость без правки use case** — подписался новый воркер,
добавил поведение, ничего не сломал.

## 3. Сущности (тезисно)

### 3.1 Identity

- `City` — справочник, slug + локализованные имена + `is_active`. Старт — Коканд.
- `User` — один аккаунт = один Telegram. `tg_id` уникален. Поля Telegram-профиля
  (username, name, photo_url, language_code) обновляются при каждом логине.
  `phone_hash` — sha256(salt+e164), без открытого телефона.
  `role`: `customer | seller | admin`.
- `SellerProfile` — расширение User для продавцов. `brand_name`, `slug`,
  `verification`, денормализованные метрики (`rating_avg`, `reviews_count`,
  `products_count`, `followers_count`, `orders_completed`).

### 3.2 Каталог

- `Category` — двухуровневое дерево (`parent_id`), локализованные имена.
- `Product` — `seller_id`, `category_id`, `city_id`, `title`, `description`,
  `price_minor` (тийины), `currency`, `prep_time_hours`, `min_order_qty`,
  `tags[]`, `attributes{}`, `status`. FULLTEXT(`title`,`description`).
- `ProductPhoto` — медиа товара, `url` + `tg_file_id` (переиспользование).
- `ChannelPost` — связь товара с публикацией в глобальном канале (channel_id,
  message_id) для edit/delete.

### 3.3 Социалка

- `Story` — 24ч TTL, только верифицированные продавцы. `expires_at` ставится
  сервисом. Архивация = `is_archived=true` (запись не удаляется — для аналитики).
- `StoryView` — UQ(story_id, viewer_id) — идемпотентный счётчик.
- `Recipe` — рецепт от любого пользователя. `ingredients[]`, `steps[]` —
  структурированный JSON. `Recipe{Like,Comment,Save}` — реакции.
- `CommunityPost` — короткие посты с фото. `PostLike`, `PostComment` —
  стандартный набор. Лента = свежесть × city_match × follower_signal.
- `Follow` — подписка покупатель → продавец, UQ(follower, seller).

### 3.4 Сделки

- `Order` — `buyer_id`, `seller_id`, суммы в `*_minor`. Атрибуция:
  `source_broadcast_id`, `source_channel_message_id`.
  Статусы:
  ```
  new → accepted → in_progress → ready → out_for_delivery → delivered
              ↓
          cancelled
              ↓
          refunded
  ```
  Переходы — только через `OrderService.transition()`, который пишет
  `OrderStatusLog` (append-only аудит) и стреляет событие `OrderStatusChanged`.
- `OrderItem` — снапшот товара на момент покупки (`title_snapshot`,
  `unit_price_minor`, `options_snapshot{}`).
- `Payment` — провайдер-агностичная модель. `provider` (Strategy на сервисе),
  `external_id`, `status`, `raw_payload` (последний webhook).
- `Review` — UQ(order_id), `rating` 1..5, опциональный `seller_reply`.
  После create → денормализуем `SellerProfile.rating_avg/reviews_count`.

### 3.5 Loyalty CRM (Lazy Data Stream)

- `SellerGroup` — клуб клиентов. `invite_slug` для deep-link
  `t.me/BegimBot?start=join_<slug>`.
- `SellerGroupMember` — UQ(group, user). **`opt_in_marketing` обязательное**
  условие для рассылки. `channels{telegram_dm, in_app_push}`, `tags[]`.
- `SellerContact` — импортированный контакт. `phone_hash` (без открытого
  телефона), `matched_user_id` (если совпали хэши), `invite_token`.
- `Broadcast` — кампания. `target_type` (`followers|group|city|repeat_buyers|all_my_customers`)
  + `target_ref` (id/slug — параметр стратегии).
  `cta_type` (`open_product|open_seller|order_now|external_url|none`).
  Денормализованные метрики: `audience_count`, `delivered_count`, `failed_count`,
  `clicked_count`, `converted_count`.
- `BroadcastDelivery` — outbox-таблица. UQ(broadcast, user) + индекс по
  (broadcast_id, status) для дешёвых LIMIT-выборок. Статусы:
  `queued → sending → delivered → read → clicked → converted` / `failed | skipped`.

### 3.6 Прочее

- `Notification` — in-app + TG-DM. `payload` — JSON с deep-link и action'ами.
- `i18n` — uz/ru/en, ключи в `i18n/locale/*.json`, доступ через `Translator`.

## 4. Инварианты (что НЕ должно ломаться)

1. **Деньги всегда `*_minor` (int)** — никаких float, никаких рублей. UZS = тийины.
2. **`OrderStatusLog` append-only** — никто не редактирует и не удаляет.
3. **Рассылка → только opt-in.** `BroadcastService.dispatch()` фильтрует
   `SellerGroupMember.opt_in_marketing=true`. На уровне сервиса assert.
4. **`Order.transition()` — единственный способ** менять `Order.status`.
   Все ветки разрешённых переходов прописаны явно (Strategy/таблица).
5. **`User.tg_id` уникален** — повторный логин = тот же user. Никаких
   merge'ей профилей.
6. **Soft-delete только там, где есть SoftDeleteMixin.** Заказы/платежи/логи
   нельзя удалять — это аудит.
7. **`ChannelPost` — единственный источник правды** для `channel_id/message_id`
   опубликованного товара. Редактируем пост → апдейтим `last_edited_at`.
8. **Контакты — только хэш.** Открытый телефон не пишем нигде, даже временно.

## 5. Паттерны проектирования

| Паттерн         | Где применён                                                 |
|-----------------|--------------------------------------------------------------|
| Repository      | `BaseRepository[T]` + per-entity репы                        |
| Unit of Work    | `db_session()` async-CM                                      |
| Strategy        | Payments (Payme/Click), BroadcastTarget, OrderTransitions     |
| Outbox          | `BroadcastDelivery` — реляционная очередь outbound сообщений |
| Observer/Events | arq tasks, подписанные на доменные события                   |
| Factory         | TG-сообщения (текст + клавиатура) — единая точка форматирования |
| Specification   | Query-объекты для сложных листингов (фильтры + сортировки)   |
| DTO             | Pydantic schemas — на границе API                            |

## 6. Подключение БД

- MySQL 8, InnoDB, utf8mb4. JSON-колонки нативные. FULLTEXT — на
  `Product(title,description)` и `Recipe(title,description)`.
- Async-драйвер aiomysql; для Alembic — pymysql (sync).
- Пул прогрет на старте, `pool_pre_ping=True`, фоновый keepalive каждые 30с.
  Используем только `db_session()` async-CM (см. `database/session.py`).

## 7. Lazy Data Stream — детальная схема

```
[Seller UI: POST /seller/broadcasts/{id}/send]
        ↓
[BroadcastService.send()]
   1. Проверяет seller=owner, status=draft|queued.
   2. Strategy.materialize_into_deliveries(broadcast_id, session)
      INSERT … SELECT — массово создаёт BroadcastDelivery(status=queued).
      Фильтр по opt_in_marketing — обязательный.
   3. Broadcast.status = QUEUED, audience_count = N.
   4. enqueue arq job: dispatch_broadcast(broadcast_id)
        ↓
[arq worker: dispatch_broadcast]
   loop:
     SELECT id FROM broadcast_deliveries
       WHERE broadcast_id=$1 AND status='queued'
       ORDER BY id
       LIMIT 25 FOR UPDATE SKIP LOCKED;
     UPDATE … SET status='sending';
     для каждой → bot.send_message(...), пишем delivered/failed,
                  обновляем счётчики Broadcast.
     если батч пустой → Broadcast.status=SENT, exit.
     иначе → sleep 1с (под лимит TG ~30 msg/s/bot) → enqueue dispatch_broadcast(b_id)
```

CTA `open_product` рендерит кнопку с deep-link
`https://t.me/BegimBot/app?startapp=p_<product_id>_b_<broadcast_id>`. Mini App
при старте парсит `startapp`, шлёт `POST /broadcasts/{b_id}/track/click` →
обновляем `clicked_at`. Заказ из этой сессии → `Order.source_broadcast_id` →
конверсия.

## 8. Roadmap (этапы реализации)

| Этап | Скоуп                                                              | Статус |
|------|--------------------------------------------------------------------|--------|
| 1    | Очистка + модели + Alembic + Litestar skeleton + DB pool           | **done** |
| 2    | Auth: middleware Telegram initData, JWT, /auth/*, /me              | next   |
| 3    | Каталог: categories, products CRUD, listing, publish → channel     |        |
| 4    | Stories + Community + Recipes                                      |        |
| 5    | Orders: cart, checkout, transitions, status logs                   |        |
| 6    | Payments: Strategy + webhooks Payme/Click                          |        |
| 7    | Bot & канал: aiogram, publisher                                    |        |
| 8    | Бэк-офис API: модерация, аналитика, города/категории               |        |
| 9    | Loyalty CRM: groups, contacts, broadcasts, Lazy Data Stream        |        |

## 9. Чек-лист «вернулся к проекту через неделю»

1. Прочитал `README.md` — поднял dev окружение?
2. Этот файл — вспомнил инварианты и состояние домена?
3. `API.md` — посмотрел, какие эндпоинты уже описаны?
4. `git log --oneline -20` — что было сделано последним?
5. `models/__init__.py` — все ли модели зарегистрированы?
6. `alembic upgrade head` — БД синхронизирована со схемой?
