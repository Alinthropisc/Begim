# 📲 begim-mobile

> **Native. Fast. Offline-capable.** Flutter app for iOS and Android — same marketplace, same community, full device power.

⚠️ **DO NOT TOUCH** this module unless you are working on the mobile app specifically.

---

## 🛠️ Stack

| | |
|--|--|
| Framework | **Flutter 3.16+** |
| Language | **Dart 3.2+** |
| Architecture | **Clean Architecture** (domain / data / presentation) |
| DI | **get_it** |
| State | Flutter-native |

---

## 🗂️ Structure

```
begim-mobile/
└── flutter_app/
    ├── lib/
    │   ├── core/
    │   │   ├── di/             # Dependency injection
    │   │   └── theme/          # Design system
    │   ├── domain/
    │   │   ├── entities/       # Pure models (freezed)
    │   │   ├── repositories/   # Contracts (interfaces)
    │   │   └── usecases/       # Business logic — no Flutter deps
    │   ├── data/
    │   │   ├── models/         # JSON ↔ entity mapping
    │   │   ├── repositories/   # Implementations
    │   │   └── datasources/    # HTTP, local storage
    │   └── presentation/
    │       ├── pages/
    │       └── widgets/
    ├── pubspec.yaml
    └── analysis_options.yaml
```

---

## 🚀 Run

```bash
cd flutter_app
flutter pub get
flutter run
```

---

## 🔌 API

Connects to `begim-backend` at port `8000`.
API contract → [`../begim-backend/API.md`](../begim-backend/API.md)

---

> Part of the [Begim monorepo](../README.md)
