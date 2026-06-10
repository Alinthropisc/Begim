# begim-miniapp — Updates

Путь к исходникам: `begim-miniapp/src/`
Telegram Mini App, порт 5174 (Cloudflare tunnel каждый раз новый URL)

---

## Что сделано

### App.tsx — полноценный Mini App
- Полный маркетплейс: Home, Catalog, Community, Favorites, Profile
- ProductCard, ProductModal с отзывами и qty
- CartDrawer + checkout через `Telegram.WebApp.sendData` (JSON с заказом → бот)
- SellerModal: профиль продавца, его товары, отзывы
- TelegramBanner: для браузерных посетителей «Открыть в Telegram»
- Поиск по name/nameUz/seller
- Избранное с счётчиком
- useTelegram hook: isTelegram, tgUser, haptic, sendData
- Нижний nav (Home/Catalog/Community/Favorites/Profile)
- Toast-уведомления

### Компоненты
- `StoriesBar.tsx` + `StoryViewer.tsx` — истории продавцов
- `CommunityView.tsx` + `CommunityPost.tsx` — лента сообщества
- `TelegramBanner.tsx` — баннер для web-посетителей

### Данные (mock)
- `data/products.ts` — Product, categories, reviews, stories
- `data/sellers.ts` — Seller тип, s1–s5

### Telegram интеграция
- `hooks/useTelegram.ts` — обёртка над Telegram.WebApp
- `index.html` — убран `overflow:hidden`, добавлен `--tg-viewport-height` (фикс скролла)
- Checkout отправляет `sendData` с деталями заказа в бот

---

## Что осталось сделать

- [ ] Проверить скролл + тап навигацию в Telegram после фикса index.html
- [ ] Подключить к реальному API бэкенда (сейчас mock data)
- [ ] ProfileView — реальная история заказов из API
- [ ] Расширенные фильтры: город, цена, рейтинг
- [ ] Форма отзыва — реальная отправка
- [ ] Обновить MINI_APP_URL в `begim-backend/.env` после каждой новой tunnel-сессии

---

## Важно при каждом запуске
```bash
cloudflared tunnel --url http://localhost:5174
# скопировать URL → вставить в begim-backend/.env MINI_APP_URL
# обновить Menu Button в BotFather
```
