# DONE — Begim Mini App на конец сессии

> Дата: 2026-06-08. Стек: React 18 + Vite 5 + Zustand + Telegram WebApp SDK +
> TypeScript (strict). Данные — через общий слой `@begim/shared` (см.
> `../begim-shared/README.md`).

## 1. Подключение к бэкенду (этой сессии)

- [x] Создан общий слой данных `begim-shared/` (типы, fetch-HTTP клиент с JWT и
      авто-refresh по 401, эндпоинты, форматтеры). Один на Mini App и бэк-офис.
- [x] `vite.config.ts`: alias `@begim/shared` + `server.fs.allow=['..']` (чтение
      слоя вне корня приложения).
- [x] `tsconfig.json`: `paths` для `@begim/shared`, include `../begim-shared`.
- [x] Восстановлен отсутствовавший `tsconfig.node.json` (ломал `npm run build`).
- [x] `.env` / `.env.example`: `VITE_API_URL` (по умолчанию `http://localhost:8000/api/v1`).
- [x] `src/vite-env.d.ts`: типизация `import.meta.env`.
- [x] `src/main.tsx`: `configureApi()` + best-effort `ensureSession(initData)` —
      авторизация по Telegram initData, не блокирует рендер.

## 2. Данные экранов (моки → API с фолбэком)

- [x] `src/data/mock.ts`: мок-продукты/сторис/категории вынесены из экранов,
      используются как graceful fallback, когда API недоступен.
- [x] `src/api/catalog.ts`: маппинг доменного `Product` бэкенда → view-модель стора
      (string id, цена в сумах, первое фото, имя продавца).
- [x] Стор `useStore` расширен слоем каталога: `products`, `productsLoading`,
      `productsOffline`, `selectedProductId`, `loadCatalog()`, `setSelectedProduct()`,
      `getProductById()`. Каталог — единый кэш для всех экранов.
- [x] `App.tsx`: `loadCatalog()` на старте (API → стор, фолбэк на моки).
- [x] `HomeScreen`: сетка товаров из стора, выбор товара → `selectedProductId`.
- [x] `CatalogScreen`: была заглушка — теперь полноценный каталог с поиском и
      фильтром по категориям.
- [x] `ProductScreen`: рендерит выбранный товар из стора (фолбэк — первый из каталога).
- [x] `CartScreen`: позиции резолвятся через `getProductById`, оформление —
      реальный `createOrder()` через общий слой (с мягким фолбэком при офлайне).

## 3. Чистка

- [x] Починены 5 предсуществующих ошибок strict TS (неиспользуемые параметры в
      dev-фолбэке `useTelegram`, лишний импорт в `SplashScreen`).

## 4. Проверки

- [x] `npx tsc --noEmit` — без ошибок.
- [x] `npx vite build` — собирается (64 модуля, ~178 kB JS / 55 kB gzip).

## 5. Сессия 2 — фиксы после запуска

- [x] **Tailwind не был подключён вообще** (UI на Tailwind-классах, но ни CDN, ни
      плагина → всё рендерилось без стилей, «дизайн вверх дном»). Поставлен
      `tailwindcss` + `@tailwindcss/vite`, плагин в `vite.config.ts`,
      `@import "tailwindcss"` в `src/index.css`. CSS-бандл вырос 1.8→23 КБ,
      утилиты (`.flex`, `.grid`, `.rounded-2xl`) в выводе — проверено сборкой.
- [x] Засеяна БД: 3 продавца + 7 опубликованных товаров (`scripts/seed.py`) —
      каталог больше не пустой.
- [x] Бэкенд: `seller_name`/`rating`/`reviews_count` добавлены в `ProductOut`
      (eager-load `seller`, Pydantic `AliasPath`). API отдаёт реальное имя
      продавца — проверено (`seller_name='Malika'`). Адаптер `isHolol` берёт из
      `tags.includes('halal')`.

> Известное: «Could not initialize WebView» — это ограничение **Telegram Desktop
> на Linux** (нет webview-бэкенда), не баг приложения. На телефоне/через туннель
> Mini App грузится. Для прод-теста в Telegram лучше отдавать прод-сборку
> (`vite build` + статика), а не dev-сервер.

Что осталось — см. `TODO.md`.
