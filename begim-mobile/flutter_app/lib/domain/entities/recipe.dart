// Domain Layer - Entities (чистый Dart, без зависимостей)
// SOLID: Single Responsibility - каждая сущность отвечает за свои данные

import 'package:freezed_annotation/freezed_annotation.dart';

part 'recipe.freezed.dart';

/// Recipe Entity (Domain Layer)
/// Design Pattern: Immutable Object (Freezed)
@freezed
class Recipe with _$Recipe {
  const factory Recipe({
    required String id,
    required String title,
    required String description,
    required String authorId,
    required String authorName,
    required String authorAvatar,
    required List<String> ingredients,
    required List<String> steps,
    required String imageUrl,
    required List<String> tags,
    required String hub, // Категория как на Habr
    required DateTime createdAt,
    @Default(0) int likesCount,
    @Default(0) int commentsCount,
    @Default(0) int savesCount,
    @Default(0) double cookingTime, // в минутах
    @Default(0) int difficulty, // 1-5
    @Default(false) bool isFeatured,
    @Default(RecipeType.post) RecipeType type,
  }) = _Recipe;
}

enum RecipeType {
  post, // Обычный пост
  tutorial, // Мастер-класс с видео
  challenge, // Челлендж (например, "Лучший пирог недели")
}
