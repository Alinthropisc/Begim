# begim-frontend — Updates

Путь к исходникам: `begim-frontend/design/src/`

---

## Что сделано

### Роутинг (App.tsx)
- `/` → LandingPage
- `/shop/*` → BegimApp (маркетплейс)
- `/admin/*` → AdminApp

### LandingPage.tsx
- Полный лендинг: герой-секция, статистика, CTA кнопки
- Переход в магазин через `onEnterShop()`

### BegimApp.tsx — маркетплейс (офф. сайт + Mini App)
- HomeView: герой, StoriesBar, категории, сетка товаров, community teaser, seller CTA
- CategoriesView: каталог по категориям
- CommunityView: лента сообщества
- FavoritesView: избранные товары
- ProfileView: профиль с историей заказов (mock)
- ProductCard, ProductModal (детальная страница товара + отзывы)
- CartDrawer: корзина + оформление заказа
- SellerModal: профиль продавца + его товары + отзывы
- SellerForm: форма заявки на регистрацию продавца
- TelegramBanner: баннер «Открыть в Telegram» для не-Telegram посетителей
- Поиск по name/nameUz/seller
- Хаптик через useTelegram
- Checkout: sendData в Telegram WebApp если открыт в Mini App, иначе — TelegramBanner

### AdminApp + страницы (design/src/admin/)
- Dashboard, Analytics, Orders, Products, Reviews, Sellers, Community, Settings
- Layout.tsx + UI.tsx компоненты

### Данные (mock)
- `data/products.ts` — Product тип, categories, reviews, stories
- `data/sellers.ts` — Seller тип, s1–s5
- `data/mock.ts` — дополнительные mock данные
- `api/catalog.ts` — заготовка под реальный API

---

## Что осталось сделать

- [ ] Подключить `api/catalog.ts` к реальному бэкенду (сейчас mock data)
- [ ] LandingPage — Telegram Login Widget (нужен `/setdomain` в BotFather)
- [ ] ProfileView — реальная история заказов из API
- [ ] Расширенные фильтры: город, диапазон цен, сортировка по рейтингу
- [ ] Форма отзыва — реальная отправка на бэкенд
- [ ] SellerForm — реальная отправка заявки на бэкенд
- [ ] Проверить экраны в `screens/` (CartScreen, CatalogScreen, RecipeDetailScreen и др.) — используются ли или это старый прототип
- [ ] SEO / meta теги для офф. сайта

---

## Стек
Vite + React + TypeScript + Tailwind, порт 5173
