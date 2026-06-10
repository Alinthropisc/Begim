# 🥮 Begim — Uy shirinliklari bozori

**Telegram Mini App** для маркетплейса домашней выпечки в Узбекистане. Платформа для женщин-предпринимательниц, которые продают выпечку через Telegram.

---

## ✨ Возможности

### Для покупателей
- 🛍️ Каталог товаров с фильтрацией по категориям
- 📱 Instagram-style Stories от продавцов
- 👥 Community feed — социальная лента с рецептами
- ❤️ Избранное, корзина, отзывы
- 🔍 Поиск по названию и продавцу
- 📲 Полная интеграция с Telegram Mini App

### Для продавцов
- 👩‍🍳 Форма заявки на регистрацию
- 📸 Публикация Stories с новыми товарами
- 💬 Community посты (рецепты, советы)
- ⭐ Рейтинг и отзывы
- 📊 Статистика заказов (в разработке)

### Технические фишки
- 🎨 Узбекско-исламский дизайн (бордо + золото + крем)
- 📱 Адаптив: веб + Telegram Mini App
- 🔐 Авторизация через Telegram (без паролей)
- 📤 Haptic Feedback при действиях
- 🎯 MainButton в Telegram для быстрых действий
- 🌐 QR-код для перехода из веба в Mini App

---

## 🚀 Быстрый старт

### Требования
- **Node.js 18+** и **npm/pnpm**
- **Python 3.11+** и [uv](https://docs.astral.sh/uv/) (для бота)
- **Telegram аккаунт** для тестирования

### 1. Установка фронтенда

```bash
# Клонировать проект
git clone <your-repo>
cd begim

# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev
```

Откройте http://localhost:5173 — увидите веб-версию.

### 2. Настройка Telegram бота

#### 2.1 Создать бота
1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. `/newbot` → введите имя → получите токен
3. `/setcommands` → отправьте:
   ```
   start - Boshlash va Mini App ochish
   help - Yordam
   myorders - Mening buyurtmalarim
   seller - Sotuvchi bo'lish
   ```

#### 2.2 Установить бота
```bash
cd bot
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -e .

# Создать .env
cp .env.example .env
```

Откройте `.env` и вставьте:
- `BOT_TOKEN` — от @BotFather
- `WEBAPP_URL` — HTTPS URL вашего Mini App (см. ниже)

#### 2.3 Запустить бота
```bash
uv run python -m bot
```

Вы увидите:
```
🚀 Starting polling...
✅ Menu button set → https://your-url.com
🤖 Bot @begim_uz_bot started
```

### 3. Хостинг Mini App (WEBAPP_URL)

#### Вариант A: ngrok (для локальной разработки)

```bash
# Терминал 1: запустить vite dev
npm run dev

# Терминал 2: пробросить наружу
ngrok http 5173
```

Получите URL типа `https://xxxx.ngrok-free.app` → вставьте в `bot/.env` как `WEBAPP_URL`.

#### Вариант B: Vercel (для продакшена)

```bash
# Установить Vercel CLI
npm i -g vercel

# Деплой
vercel --prod
```

Получите URL типа `https://begim.vercel.app` → вставьте в `bot/.env`.

#### Вариант C: Netlify

```bash
# Собрать проект
npm run build

# Drag & drop папку dist/ на https://app.netlify.com/drop
```

### 4. Подключить Mini App к боту

1. Откройте [@BotFather](https://t.me/BotFather)
2. `/mybots` → выберите бота → **Bot Settings** → **Menu Button**
3. Отправьте URL вашего Mini App (из ngrok/Vercel/Netlify)
4. Заголовок кнопки: `🥮 Begim`

Теперь в чате с ботом слева от поля ввода появится кнопка **🥮 Begim** — нажмите её, откроется Mini App!

---

## 📱 Тестирование на Android

### Шаг 1: Запустить всё локально
```bash
# Терминал 1: фронтенд
npm run dev

# Терминал 2: ngrok
ngrok http 5173

# Терминал 3: бот
cd bot
uv run python -m bot
```

### Шаг 2: Настроить бота
Вставьте ngrok URL в `bot/.env`:
```env
WEBAPP_URL=https://xxxx.ngrok-free.app
```

Перезапустите бота (`Ctrl+C` → `uv run python -m bot`).

### Шаг 3: Открыть на телефоне
1. Откройте **Telegram на Android**
2. Найдите своего бота по username (например, `@begim_uz_bot`)
3. Нажмите **Start**
4. Нажмите кнопку **🥮 Begim** внизу слева (слева от поля ввода)
5. Mini App откроется!

### Что тестировать:
- ✅ Stories (кликните на кружочки)
- ✅ Каталог товаров (фильтры, поиск)
- ✅ Добавление в корзину
- ✅ Оформление заказа (должно отправить данные боту)
- ✅ Community feed (лайки)
- ✅ Профиль (должно показать ваше имя из Telegram)

---

## 🔧 Конфигурация

### `src/config.ts` — настройки бота
```typescript
export const BOT_CONFIG = {
  botUsername: "begim_uz_bot",        // ← измените на ваш
  supportUsername: "begim_support",   // ← техподдержка
  channelUsername: "begim_uz",        // ← канал новостей
};
```

### `bot/.env` — переменные окружения
```env
BOT_TOKEN=1234567890:YOUR_TOKEN
WEBAPP_URL=https://your-app.vercel.app
BOT_MODE=production
```

---

## 📦 Структура проекта

```
begim/
├── src/
│   ├── App.tsx                    # Главный компонент
│   ├── config.ts                  # Конфиг бота
│   ├── data/
│   │   └── products.ts            # Товары, Stories, Community
│   ├── components/
│   │   ├── StoriesBar.tsx         # Лента сторис
│   │   ├── StoryViewer.tsx        # Просмотр сторис
│   │   ├── CommunityView.tsx      # Community feed
│   │   ├── CommunityPost.tsx      # Пост в ленте
│   │   └── TelegramBanner.tsx     # QR-код для перехода
│   ├── hooks/
│   │   └── useTelegram.ts         # Telegram WebApp API
│   └── index.css                  # Стили + паттерны
│
├── bot/
│   ├── bot/
│   │   └── __main__.py            # Telegram бот
│   ├── .env.example               # Шаблон переменных
│   ├── pyproject.toml             # Зависимости Python
│   └── README.md                  # Документация бота
│
├── dist/                          # Сборка (npm run build)
├── index.html                     # Точка входа
├── package.json
└── README.md                      # ← вы здесь
```

---

## 🎨 Дизайн-система

### Цвета
- **Бордо**: `#8B2635` (основной)
- **Золото**: `#C9A961` (акцент)
- **Крем**: `#FBF5EC` (фон)
- **Изумруд**: `#2D5F4E` (успех, halol)
- **Чернила**: `#2B1810` (текст)

### Шрифты
- **Cormorant Garamond** — заголовки (элегантный серифный)
- **Amiri** — логотип (арабская вязь)
- **Inter** — UI (чистый sans-serif)

### Паттерны
Исламская геометрия (8-конечные звёзды) через SVG в CSS.

---

## 🔐 Безопасность

### Токен бота
- **НИКОГДА** не коммитьте `.env` в git
- Если токен утёк — немедленно `/revoke` в @BotFather
- Ротируйте токен раз в квартал

### Валидация initData (для прода)
```python
from aiogram.utils.web_app import check_webapp_signature

if not check_webapp_signature(BOT_TOKEN, init_data):
    raise SecurityError("Invalid initData")
```

---

## 🚢 Деплой в продакшен

### 1. Фронтенд (Vercel)
```bash
npm run build
vercel --prod
```

### 2. Бот (VPS/сервер)
```bash
# На сервере
git clone <your-repo>
cd bot
uv venv
uv pip install -e .

# Настроить .env
nano .env

# Запустить через systemd
sudo nano /etc/systemd/system/begim-bot.service
sudo systemctl enable begim-bot
sudo systemctl start begim-bot
```

Пример `begim-bot.service`:
```ini
[Unit]
Description=Begim Telegram Bot
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/begim/bot
ExecStart=/home/ubuntu/begim/bot/.venv/bin/python -m bot
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 3. Обновить WEBAPP_URL
В `bot/.env` укажите продакшен URL (например, `https://begim.vercel.app`).

---

## 📚 Документация

- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [Aiogram 3 Guide](https://mastergroosha.github.io/aiogram-3-guide/)
- [BotFather Commands](https://core.telegram.org/bots#commands)
- [React + Vite + Tailwind](https://vitejs.dev/guide/)

---

## 🆘 Проблемы

### Mini App не открывается
- Проверьте что URL начинается с `https://`
- Убедитесь что бот запущен и `Menu button` установлен
- Обновите Telegram до последней версии

### Белый экран в Mini App
- Откройте DevTools (включите через @BotFather → `/mybots` → **Bot Settings** → **Menu Button**)
- Проверьте консоль на ошибки

### initData пустой
- Обновите Telegram до последней версии
- Проверьте что бот запущен

### "Button_type_invalid"
- web_app кнопки работают только в личке, не в группах

---

## 📄 Лицензия

MIT © 2026 Begim

---

## 💬 Поддержка

- Telegram: [@begim_support](https://t.me/begim_support)
- Канал: [@begim_uz](https://t.me/begim_uz)
- Email: support@begim.uz

---

**Made with ❤️ in Uzbekistan** 🇺🇿

*Bismillahir Rohmanir Rohiym* ✦
