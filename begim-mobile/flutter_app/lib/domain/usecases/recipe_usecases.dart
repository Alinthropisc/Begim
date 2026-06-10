// Domain Layer - Use Cases
// SOLID: Single Responsibility + Open/Closed
// Design Pattern: Command Pattern (каждый use case = команда)

import 'package:dartz/dartz.dart';
import '../entities/recipe.dart';
import '../entities/failure.dart';
import '../repositories/recipe_repository.dart';

/// Get Recipes Use Case
class GetRecipesUseCase {
  final IRecipeRepository _repository;

  GetRecipesUseCase(this._repository);

  ResultFuture<List<Recipe>> call({
    String? hubId,
    String? tag,
    RecipeType? type,
    int page = 1,
    int limit = 20,
  }) {
    return _repository.getRecipes(
      hubId: hubId,
      tag: tag,
      type: type,
      page: page,
      limit: limit,
    );
  }
}

/// Get Featured Recipes Use Case
class GetFeaturedRecipesUseCase {
  final IRecipeRepository _repository;

  GetFeaturedRecipesUseCase(this._repository);

  ResultFuture<List<Recipe>> call() {
    return _repository.getFeaturedRecipes();
  }
}

/// Get Trending Recipes Use Case
class GetTrendingRecipesUseCase {
  final IRecipeRepository _repository;

  GetTrendingRecipesUseCase(this._repository);

  ResultFuture<List<Recipe>> call({int limit = 10}) {
    return _repository.getTrendingRecipes(limit: limit);
  }
}

/// Get Recipe By ID Use Case
class GetRecipeByIdUseCase {
  final IRecipeRepository _repository;

  GetRecipeByIdUseCase(this._repository);

  ResultFuture<Recipe> call(String id) {
    return _repository.getRecipeById(id);
  }
}

/// Like Recipe Use Case
class LikeRecipeUseCase {
  final IRecipeRepository _repository;

  LikeRecipeUseCase(this._repository);

  ResultFuture<void> call(String recipeId) {
    return _repository.likeRecipe(recipeId);
  }
}

/// Save Recipe Use Case
class SaveRecipeUseCase {
  final IRecipeRepository _repository;

  SaveRecipeUseCase(this._repository);

  ResultFuture<void> call(String recipeId) {
    return _repository.saveRecipe(recipeId);
  }
}

/// Search Recipes Use Case
class SearchRecipesUseCase {
  final IRecipeRepository _repository;

  SearchRecipesUseCase(this._repository);

  ResultFuture<List<Recipe>> call(String query) {
    return _repository.searchRecipes(query);
  }
}
