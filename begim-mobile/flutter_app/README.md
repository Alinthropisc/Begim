# 🥮 Begim — Mobile App (Clean Architecture)

**Uy shirinliklari bozori** — маркетплейс домашней выпечки в Узбекистане + уникальное сообщество кулинаров.

[![Flutter](https://img.shields.io/badge/Flutter-3.16+-02569B?logo=flutter)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.2+-0175C2?logo=dart)](https://dart.dev)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🏗 Архитектура (Clean Architecture + SOLID)

```
lib/
├── core/                          # Общие модули
│   ├── di/injection.dart          # Dependency Injection (get_it)
│   └── theme/                     # Дизайн-система
│
├── domain/                        # 🧠 Бизнес-логика (НЕ зависит от Flutter)
│   ├── entities/                  # Чистые модели (freezed)
│   │   ├── recipe.dart
│   │   ├── comment.dart
│   │   ├── user.dart
│   │   ├── hub.dart
│   │   └── failure.dart           # Functional errors (dartz Either)
│   ├── repositories/              # Интерфейсы (абстракции)
│   └── usecases/                  # Use Cases (Command Pattern)
│
├── data/                          # 💾 Данные
│   ├── models/                    # DTO (JSON serialization)
│   ├── datasources/
│   │   ├── remote/                # API (Dio + Retrofit)
│   │   └── local/                 # Hive / SharedPreferences
│   └── repositories/              # Реализации интерфейсов
│
└── presentation/                  # 🎨 UI
    ├── blocs/                     # BLoC (Observer Pattern)
    ├── screens/
    │   ├── splash/
    │   ├── home/
    │   ├── catalog/
    │   ├── cart/
    │   ├── profile/
    │   ├── community/             # 🌟 Уникальный формат
    │   └── recipe_detail/         # С комментариями и реакциями
    └── widgets/                   # Переиспользуемые виджеты
```

---

## 🎯 Принципы программирования

### SOLID

| Принцип | Реализация |
|---------|-----------|
| **S**ingle Responsibility | Каждый UseCase = 1 задача, каждый BLoC = 1 фича |
| **O**pen/Closed | Интерфейсы `IRecipeRepository` можно расширять без изменения клиентов |
| **L**iskov Substitution | Все реализации `IRepository` взаимозаменяемы |
| **I**nterface Segregation | Мелкие интерфейсы (`IRecipeRepository`, `ICommentRepository`) |
| **D**ependency Inversion | BLoC зависит от интерфейсов, не от реализаций |

### Design Patterns

- **Repository Pattern** — абстракция от источников данных
- **BLoC Pattern** — управление состоянием (Observer + State)
- **Dependency Injection** — через `get_it`
- **Factory Pattern** — Freezed для immutable объектов
- **Command Pattern** — каждый UseCase = команда
- **Strategy Pattern** — разные типы контента (post/tutorial/challenge)
- **Result Pattern** — `Either<Failure, T>` из dartz
- **Observer Pattern** — BLoC + Stream

### DRY

- Общие темы в `core/theme/`
- Переиспользуемые виджеты в `shared/widgets/`
- Общие Use Cases для всех экранов

### KISS

- Простой BLoC вместо сложных state management
- Понятные имена (Recipe, Comment, Hub)
- Flat структура файлов

---

## ✨ Killer Features

### 1. 🏆 **Challenges** (Челленджи)
Еженедельные кулинарные конкурсы с призовым фондом:
- Участники публикуют свои варианты
- Сообщество голосует (karma)
- Топ-3 получают призы
- Интеграция с продавцами (победители продают свои десерты)

### 2. 🎓 **Master-klass** (Мастер-классы)
Видео-уроки от топ-продавцов:
- Пошаговые инструкции с видео
- Таймеры для каждого этапа
- "Retsept kalkulyatori" — расчёт ингредиентов на порции
- Сертификаты за прохождение

### 3. 📅 **Bugungi Menyu** (Меню дня)
Подписка на ежедневную выпечку:
- Каждое утро новое предложение
- Push-уведомления в 9:00
- Скидка 15% для подписчиков

### 4. 🎉 **Bayram Buyurtmasi** (Предзаказ на праздники)
Предзаказ на Ramazon Hayit, Navruz, свадьбы:
- Календарь праздников
- Бронирование за 7-30 дней
- Коллективные заказы (экономия)

### 5. 🏘 **Qo'shni Yetkazish** (Соседская доставка)
Группировка заказов по районам:
- Экономия на доставке
- Минимум 3 соседа для активации
- Чат для координации

### 6. 🚀 **Boost** (Продвижение постов)
Платное продвижение в ленте:
- 1 день Boost = 10 000 показов
- Оплата через Click/Payme
- Статистика эффективности

### 7. 🧮 **Retsept Kalkulyatori**
Умный калькулятор ингредиентов:
- Вводишь количество порций → пересчёт
- Замена ингредиентов (аллергии)
- Автосписок покупок

### 8. ⭐ **Karma System**
Система репутации:
- Уровни: Boshlovchi → Havaskor → Professional → Ekspert → Usta
- Бонусы за активность
- Проверенные авторы (галочка)

---

## 💬 Уникальное сообщество (Habr + TProger + Instagram)

**НЕ копия**, а свой формат:

### Фичи:
- **Хабы** (категории): Tortlar, Milliy, Master-klass, Challenges
- **Karma** авторов с уровнями и значками
- **Типы контента**: 
  - 📖 Retsept (обычный рецепт)
  - 🎓 Master-klass (с видео)
  - 🏆 Challenge (конкурс)
- **Emoji реакции** (как в Telegram): ❤️ 🔥 👏 ⭐ 😂 😮 😢 🎉
- **Threading** в комментариях (ответы на ответы)
- **Karma за комментарии** (качественные поднимаются)
- **Boost** для продвижения
- **Закладки** с коллекциями
- **Теги и хабы** как на Habr
- **Rich-контент**: текст + фото + видео + ингредиенты

### Почему уникально?
1. **Кулинарный фокус** — не общий контент
2. **Интеграция с маркетплейсом** — рецепт → купить ингредиенты
3. **Геймификация** — уровни, достижения, челленджи
4. **Социальный аспект** — соседская доставка, коллективные заказы
5. **Узбекский контекст** — национальные рецепты, праздники, язык

---

## 🚀 Быстрый старт

### Требования
- Flutter SDK 3.16+
- Dart 3.2+
- Android Studio / VS Code
- Xcode (для iOS)

### Установка

```bash
cd flutter_app

# Получить зависимости
flutter pub get

# Запустить кодгенерацию (freezed, json_serializable)
flutter pub run build_runner build --delete-conflicting-outputs

# Запустить
flutter run
```

### Сборка

```bash
# Android APK
flutter build apk --release

# Android AAB (для Play Store)
flutter build appbundle --release

# iOS
flutter build ios --release
```

---

## 📱 Скриншоты

| Splash | Home | Community | Recipe |
|--------|------|-----------|--------|
| ![Splash](docs/splash.png) | ![Home](docs/home.png) | ![Community](docs/community.png) | ![Recipe](docs/recipe.png) |

---

## 🔮 Roadmap

### MVP (сейчас)
- [x] Clean Architecture
- [x] Community с хабами и karma
- [x] Рецепты с комментариями
- [x] Emoji реакции
- [x] Challenges

### v1.1
- [ ] Подключение к FastAPI бэкенду
- [ ] Telegram Mini App интеграция
- [ ] Push-уведомления (Firebase)
- [ ] Локализация (uz/ru/en)

### v1.2
- [ ] Мастер-классы с видео
- [ ] Retsept Kalkulyatori
- [ ] Qo'shni Yetkazish
- [ ] Оплата (Click/Payme)

### v2.0
- [ ] AI-рекомендации
- [ ] AR примерка десертов
- [ ] Live-стримы мастер-классов
- [ ] Marketplace интеграция

---

## 🧪 Тестирование

```bash
# Unit tests
flutter test

# Widget tests
flutter test test/widget_test.dart

# Integration tests
flutter test integration_test/
```

---

## 📦 Зависимости

| Пакет | Назначение |
|-------|-----------|
| `flutter_bloc` | State Management (BLoC) |
| `get_it` | Dependency Injection |
| `dartz` | Functional Programming (Either) |
| `freezed` | Immutable models |
| `go_router` | Навигация |
| `dio` | HTTP клиент |
| `retrofit` | API generation |
| `hive` | Local storage |
| `cached_network_image` | Image caching |

---

## 🎨 Дизайн-система

### Цвета
- **Bordeaux** `#8B2635` — основной
- **Gold** `#C9A961` — акцент
- **Cream** `#FBF5EC` — фон
- **Emerald** `#2D5F4E` — успех
- **Ink** `#2B1810` — текст

### Шрифты
- **Cormorant Garamond** — заголовки
- **Amiri** — логотип
- **Inter** — UI

---

## 📄 Лицензия

MIT © 2026 Begim

---

## 💬 Контакты

- **Telegram:** [@begim_support](https://t.me/begim_support)
- **Канал:** [@begim_uz](https://t.me/begim_uz)
- **Email:** support@begim.uz

---

**Made with ❤️ in Uzbekistan** 🇺🇿  
*Bismillahir Rohmanir Rohiym* ✦
