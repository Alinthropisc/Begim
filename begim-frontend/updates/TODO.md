# TODO — Begim Frontend (веб + бэк-офис)

> Что осталось после подключения общего слоя. Упорядочено по приоритету.

## 🔴 Авторизация админа

- [ ] Telegram Login Widget (или вход через бота) → `loginWithTelegram(initData)`.
      Сейчас `configureApi` задаёт только базовый URL; токенов нет, поэтому все
      admin-эндпоинты вернут 401 и UI остаётся на моках.
- [ ] Гард на admin-маршруты: если `role !== 'admin'` — экран «нет доступа».
- [ ] Сверить форму ответа `/admin/dashboard` с `AdminDashboard` в
      `begim-shared/admin.ts` и расширить маппинг в `src/admin/api.ts`
      (сейчас мапятся только orders_total, gmv_minor, sellers_total, users_total,
      sellers_pending; deltas/conversion/pendingReviews/reportedPosts — моки).

## 🟡 Страницы админки на моках → API

Эндпоинты в `begim-shared/admin.ts` уже есть:

- [ ] **Orders** — `getAdminOrders(status)`.
- [ ] **Sellers** — `getAdminSellers(verification)` + `verifySeller(id, approve)`.
- [ ] **Products** — `getAdminProducts(status)` + `blockProduct(id)`.
- [ ] **Cities** (в Settings) — `createCity()`, `toggleCity()`.
- [ ] **Users** — `getAdminUsers()`.
- [ ] **Reviews / Community** — эндпоинтов модерации в API.md пока нет, нужен
      бэкенд (см. backend `updates/TODO.md` пп. 19–20).

Паттерн подключения — как `useAdminStats` в `src/admin/api.ts`: хук с фолбэком
на существующий мок, чтобы UI не ломался без API.

## 🟢 Лендинг и качество

- [ ] Публичный лендинг (`src/App.tsx`, `data/products.ts`) — витрина может тянуть
      `listProducts()` через общий слой (тот же адаптер, что в Mini App).
- [ ] `BOT_CONFIG` в `src/config.ts` синхронизировать с реальным username бота из
      `begim-backend/.env` (`TELEGRAM_BOT_TOKEN` / `MINI_APP_URL`).
- [ ] Единый формат денег — переиспользовать `formatMoney` из `@begim/shared`
      вместо локального `formatPrice` в `data.ts`.
