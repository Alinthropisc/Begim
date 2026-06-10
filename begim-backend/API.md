# Begim API

> Базовый префикс: `/api/v1`.
> Транспорт: JSON. Время — ISO-8601 UTC. Деньги — целые `*_minor` (тийины UZS).

Этот файл — **актуальный контракт** для Mini App, бэк-офиса и бота. Эндпоинты
помеченные `🚧 planned` ещё не реализованы — добавляются по мере прохождения
этапов 2-9 (см. `API_DOCS.Domain.md`).

---

## Содержание
1. [Auth](#1-auth)
2. [Cities & Categories](#2-cities--categories)
3. [Users & Profile](#3-users--profile)
4. [Sellers](#4-sellers)
5. [Products](#5-products)
6. [Stories](#6-stories)
7. [Community & Recipes](#7-community--recipes)
8. [Follows](#8-follows)
9. [Orders](#9-orders)
10. [Payments](#10-payments)
11. [Reviews](#11-reviews)
12. [Seller Groups (Loyalty CRM)](#12-seller-groups-loyalty-crm)
13. [Contacts Import](#13-contacts-import)
14. [Broadcasts (Lazy Data Stream)](#14-broadcasts-lazy-data-stream)
15. [Notifications](#15-notifications)
16. [Admin / Back-office](#16-admin--back-office)
17. [Webhooks](#17-webhooks)
18. [Error format](#error-format)

---

## 1. Auth

Все клиенты (Mini App, бэк-офис, мобилка позже) логинятся через Telegram.
Сервер валидирует `initData` HMAC по `TELEGRAM_BOT_TOKEN`, выдаёт JWT.

| Method | Path                    | Описание                                    |
|--------|-------------------------|---------------------------------------------|
| POST   | `/auth/telegram`        | initData → JWT (access + refresh)           |
| POST   | `/auth/refresh`         | refresh → новый access                      |
| POST   | `/auth/logout`          | инвалидирует refresh                        |
| GET    | `/auth/me`              | текущий пользователь по JWT                 |

**POST `/auth/telegram`**
```json
{ "init_data": "query_id=...&user=...&auth_date=...&hash=..." }
```
**Ответ:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": { "id": 12, "tg_id": 12345, "role": "customer", "locale": "uz" }
}
```

## 2. Cities & Categories

Справочники. Активный город — `is_active=true`.

| Method | Path                    | Описание                                |
|--------|-------------------------|-----------------------------------------|
| GET    | `/cities`               | список активных городов                 |
| GET    | `/categories`           | дерево категорий (parent → children)    |

## 3. Users & Profile

| Method | Path                       | Описание                                       |
|--------|----------------------------|------------------------------------------------|
| GET    | `/me`                      | мой профиль                                    |
| PATCH  | `/me`                      | display_name, locale, city_id, marketing_opt_in |
| PATCH  | `/me/phone`                | привязать телефон (хэшируем sha256+salt)       |
| GET    | `/me/orders`               | мои заказы                                     |
| GET    | `/me/saved-recipes`        | мои сохранённые рецепты                        |
| GET    | `/me/follows`              | продавцы, на которых я подписан                |

## 4. Sellers

| Method | Path                                    | Описание                            |
|--------|-----------------------------------------|-------------------------------------|
| POST   | `/sellers`                              | стать продавцом (создаёт SellerProfile, role=seller, верификация = pending) |
| GET    | `/sellers/{id_or_slug}`                 | публичный профиль                   |
| GET    | `/sellers/{id}/products`                | каталог продавца                    |
| GET    | `/sellers/{id}/stories`                 | активные сторис                     |
| GET    | `/sellers/{id}/reviews`                 | отзывы                              |
| PATCH  | `/sellers/me`                           | редактировать свой профиль          |

## 5. Products

| Method | Path                                | Описание                                       |
|--------|-------------------------------------|------------------------------------------------|
| GET    | `/products`                         | листинг: `?city=&category=&q=&sort=&offset=&limit=` |
| GET    | `/products/{id}`                    | карточка                                       |
| POST   | `/products`                         | создать draft (seller)                         |
| PATCH  | `/products/{id}`                    | обновить (seller=owner)                        |
| POST   | `/products/{id}/publish`            | draft → published (триггерит arq → канал)      |
| POST   | `/products/{id}/archive`            | вывести из продажи                             |
| POST   | `/products/{id}/photos`             | загрузить фото                                 |
| DELETE | `/products/{id}/photos/{photo_id}`  | удалить фото                                   |

Сортировка: `recent | popular | rating | price_asc | price_desc`.

## 6. Stories

| Method | Path                              | Описание                              |
|--------|-----------------------------------|---------------------------------------|
| GET    | `/stories/feed`                   | сторисы продавцов из моего города + те, на кого подписан |
| POST   | `/stories`                        | создать (seller, verified)            |
| POST   | `/stories/{id}/view`              | пометить просмотр (идемпотентно)      |
| DELETE | `/stories/{id}`                   | удалить свою                          |

## 7. Community & Recipes

| Method | Path                              | Описание                              |
|--------|-----------------------------------|---------------------------------------|
| GET    | `/feed`                           | лента постов и рецептов               |
| POST   | `/posts`                          | создать пост (любой user)             |
| POST   | `/posts/{id}/like` / `unlike`     |                                       |
| POST   | `/posts/{id}/comments`            |                                       |
| GET    | `/recipes`                        | каталог рецептов с фильтрами          |
| GET    | `/recipes/{id}`                   | детальная                             |
| POST   | `/recipes`                        | создать                               |
| POST   | `/recipes/{id}/like` / `save`     |                                       |
| POST   | `/recipes/{id}/comments`          |                                       |

## 8. Follows

| Method | Path                          | Описание                       |
|--------|-------------------------------|--------------------------------|
| POST   | `/sellers/{id}/follow`        | подписаться                    |
| DELETE | `/sellers/{id}/follow`        | отписаться                     |

## 9. Orders

| Method | Path                            | Описание                                                  |
|--------|---------------------------------|-----------------------------------------------------------|
| POST   | `/orders`                       | создать (items, delivery, source_broadcast_id?)           |
| GET    | `/orders/{id}`                  | детальная (buyer или seller)                              |
| GET    | `/seller/orders`                | заказы для текущего продавца с фильтром по статусу        |
| POST   | `/orders/{id}/transition`       | смена статуса (Strategy: разрешённые переходы по роли)    |
| POST   | `/orders/{id}/cancel`           | отмена с причиной                                         |

Статусы и допустимые переходы — см. `API_DOCS.Domain.md`.

## 10. Payments

| Method | Path                                | Описание                                    |
|--------|-------------------------------------|---------------------------------------------|
| POST   | `/orders/{id}/payments`             | создать платёж: body=`{provider: "payme"\|"click"\|"cash"}`. Возвращает `checkout_url`. |
| GET    | `/payments/{id}`                    | статус                                      |
| POST   | `/webhooks/payme`                   | вебхук Payme                                |
| POST   | `/webhooks/click`                   | вебхук Click                                |

## 11. Reviews

| Method | Path                            | Описание                            |
|--------|---------------------------------|-------------------------------------|
| POST   | `/orders/{id}/review`           | оставить отзыв (только после delivered) |
| POST   | `/reviews/{id}/reply`           | ответ продавца                      |

## 12. Seller Groups (Loyalty CRM)

| Method | Path                                          | Описание                              |
|--------|-----------------------------------------------|---------------------------------------|
| GET    | `/seller/groups`                              | мои группы                            |
| POST   | `/seller/groups`                              | создать                               |
| PATCH  | `/seller/groups/{id}`                         |                                       |
| GET    | `/seller/groups/{id}/members`                 | пагинированный список                 |
| POST   | `/seller/groups/{id}/members`                 | добавить (вручную)                    |
| DELETE | `/seller/groups/{id}/members/{user_id}`       | удалить                               |
| POST   | `/groups/join/{invite_slug}`                  | присоединиться по deep-link           |
| POST   | `/seller/groups/{id}/members/{user_id}/tags`  | поставить теги                        |

## 13. Contacts Import

| Method | Path                                  | Описание                                     |
|--------|---------------------------------------|----------------------------------------------|
| POST   | `/seller/contacts/import`             | `{contacts: [{phone, name}]}` — телефоны хэшируются на бэке; matched → возвращаются с `matched_user_id` |
| GET    | `/seller/contacts`                    | мои импортированные контакты с фильтром по статусу |
| POST   | `/seller/contacts/{id}/invite`        | послать soft-permission приглашение в клуб (matched) или вернуть deep-link (unmatched) |

## 14. Broadcasts (Lazy Data Stream)

| Method | Path                                  | Описание                                            |
|--------|---------------------------------------|-----------------------------------------------------|
| POST   | `/seller/broadcasts`                  | создать `draft` (title, body, media, target, cta)   |
| GET    | `/seller/broadcasts`                  | список со статусами и метриками                     |
| GET    | `/seller/broadcasts/{id}`             | детально (включая sample preview)                   |
| POST   | `/seller/broadcasts/{id}/send`        | materialize_deliveries + enqueue arq dispatcher     |
| POST   | `/seller/broadcasts/{id}/cancel`      | прервать на середине (queued → skipped)             |
| POST   | `/broadcasts/{id}/track/click`        | Mini App-side: фиксирует клик из deep-link          |

Стратегии таргета:
- `followers` — все, кто подписан на продавца с `marketing_opt_in=true`
- `group` (`target_ref=<group_id>`) — opt-in члены группы
- `city` (`target_ref=<city_id>`) — admin-only (для коммуникаций платформы)
- `repeat_buyers` — те, кто сделал ≥2 заказа у продавца
- `all_my_customers` — все заказчики продавца с opt-in

## 15. Notifications

| Method | Path                            | Описание                            |
|--------|---------------------------------|-------------------------------------|
| GET    | `/me/notifications`             | список                              |
| POST   | `/me/notifications/{id}/read`   | пометить прочитанным                |
| POST   | `/me/notifications/read-all`    |                                     |

## 16. Admin / Back-office

Требуют `role=admin`. Доступны через тот же Telegram-логин.

| Method | Path                                | Описание                          |
|--------|-------------------------------------|-----------------------------------|
| GET    | `/admin/dashboard`                  | агрегаты                          |
| GET    | `/admin/sellers?verification=pending` | модерация                       |
| POST   | `/admin/sellers/{id}/verify`        | verify / reject                   |
| GET    | `/admin/products?status=blocked`    |                                   |
| POST   | `/admin/products/{id}/block`        |                                   |
| POST   | `/admin/cities`                     | добавить новый город              |
| PATCH  | `/admin/cities/{id}`                | активировать/деактивировать       |
| POST   | `/admin/categories`                 |                                   |
| GET    | `/admin/orders?status=...`          |                                   |
| GET    | `/admin/users`                      |                                   |

## 17. Webhooks

| Method | Path                          | Источник         |
|--------|-------------------------------|------------------|
| POST   | `/webhooks/telegram`          | Telegram (бот)   |
| POST   | `/webhooks/payme`             | Payme            |
| POST   | `/webhooks/click`             | Click            |

---

## Error format

Единый формат ошибок:
```json
{
  "error": {
    "code": "PRODUCT_NOT_PUBLISHABLE",
    "message": "Cannot publish: product missing photos",
    "details": { "missing": ["photos"] }
  }
}
```
HTTP-статусы: `400` (валидация), `401` (нет JWT/initData), `403` (роль), `404`,
`409` (бизнес-конфликт, напр. невалидный переход статуса), `422` (Pydantic),
`429` (rate-limit), `5xx` (наша ошибка).
