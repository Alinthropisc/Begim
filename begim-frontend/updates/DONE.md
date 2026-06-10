# DONE — Begim Frontend (веб + бэк-офис) на конец сессии

> Дата: 2026-06-08. Приложение в `design/`. Стек: React 19 + Vite 7 +
> Tailwind v4 + vite-plugin-singlefile (сборка в один index.html). Данные —
> через общий слой `@begim/shared`.

## 1. Подключение к общему слою (этой сессии)

- [x] `design/vite.config.ts`: alias `@begim/shared` → `../../begim-shared/index.ts`
      + `server.fs.allow=['../..']`.
- [x] `design/tsconfig.json`: `paths` для `@begim/shared`.
- [x] `design/.env` / `.env.example`: `VITE_API_URL`.
- [x] `design/src/vite-env.d.ts`: типизация `import.meta.env`.
- [x] `design/src/main.tsx`: `configureApi({ baseUrl })`. Авторизация админа —
      отдельно (Telegram Login), здесь только базовый URL + хранилище токенов.

## 2. Первый живой поток данных

- [x] `design/src/admin/api.ts`: `fetchAdminStats()` + хук `useAdminStats()` —
      сливают живые агрегаты `getAdminDashboard()` в форму мок-`adminStats`,
      с graceful fallback на моки при недоступном API.
- [x] `design/src/admin/pages/Dashboard.tsx`: карточки статистики берут данные
      из `useAdminStats()` (числа подменяются живыми, когда API ответит).

## 3. Проверки

- [x] `npx tsc --noEmit` — без ошибок.
- [x] `npx vite build` — собирается (1794 модуля, single-file ~445 kB / 124 kB gzip).

Остальные страницы админки (Orders, Sellers, Products, Reviews, Community,
Analytics) и лендинг пока на моках — план в `TODO.md`.
