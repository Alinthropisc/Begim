# TODO — Begim Mini App

> Что осталось после подключения к бэкенду. Упорядочено по приоритету.

## 🔴 Прежде чем ехать на реальном API

### 1. Сверить контракт ответов с бэкендом
Адаптер `src/api/catalog.ts` ожидает поля `Product` из `begim-shared/types.ts`
(`title`, `price_minor`, `photos[].url`, `seller_name`, `is_halal`, `rating`,
`reviews_count`). Проверить реальные имена в ответе `/products` и поправить
маппинг, если расходится. `/products` ожидается как `Paginated<Product>`
(`{items,total,offset,limit}`).

### 2. Категории: id вместо slug
Сейчас фильтр в `CatalogScreen` сравнивает `p.category` (это `String(category_id)`)
с slug-ами мок-категорий (`cakes`, `sweets`…). На реальных данных фильтр не
совпадёт. Нужно: грузить категории через `getCategories()` и фильтровать по `id`.

### 3. MainButton-оформление дублирует кнопку корзины
`App.tsx` вешает на Telegram `MainButton` старый обработчик (alert + clearCart),
а реальный заказ создаёт кнопка в `CartScreen`. Свести к одному: либо MainButton
вызывает тот же `checkout()`, либо убрать кнопку из экрана.

## 🟡 Функционал на моках — подключить к API

- [ ] **Сторис**: `HomeScreen` использует `mockStories`. Подключить `getStoriesFeed()`
      + `viewStory(id)`.
- [ ] **Сообщество/рецепты**: `CommunityScreen`, `RecipeDetailScreen` — на моках.
      Эндпоинты готовы: `getFeed`, `listRecipes`, `getRecipe`, `likePost`, `saveRecipe`.
- [ ] **Профиль**: `ProfileScreen` — `fetchMe()`, `getMyOrders()`, `getMyFollows()`,
      `getSavedRecipes()`, привязка телефона `setMyPhone()`.
- [ ] **Уведомления**: бейдж «2» в шапке захардкожен — `getNotifications()`.
- [ ] **Избранное**: `favorites` живёт только в сторе. Бэкенд follows/saved есть —
      решить, маппить ли избранное на сохранённые рецепты/подписки.

## 🟢 Качество

- [ ] Экран/баннер офлайн-режима, когда `productsOffline === true`.
- [ ] Платёж после заказа: `createPayment(orderId, provider)` → `checkout_url`.
- [ ] Состояния загрузки/ошибки на всех экранах (сейчас только в каталоге).
- [ ] eslint прогон (`npm run lint`) и базовые тесты адаптеров.
