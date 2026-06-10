// Domain Layer - Repository Interfaces (абстракции)
// SOLID: Interface Segregation + Dependency Inversion
// Design Pattern: Repository Pattern

import 'package:dartz/dartz.dart';
import '../entities/recipe.dart';
import '../entities/comment.dart';
import '../entities/hub.dart';
import '../entities/failure.dart';

/// Recipe Repository Interface
abstract class IRecipeRepository {
  ResultFuture<List<Recipe>> getRecipes({
    String? hubId,
    String? tag,
    RecipeType? type,
    int page = 1,
    int limit = 20,
  });

  ResultFuture<Recipe> getRecipeById(String id);

  ResultFuture<List<Recipe>> getFeaturedRecipes();

  ResultFuture<List<Recipe>> getTrendingRecipes({int limit = 10});

  ResultFuture<Recipe> createRecipe(Recipe recipe);

  ResultFuture<void> likeRecipe(String recipeId);

  ResultFuture<void> saveRecipe(String recipeId);

  ResultFuture<List<Recipe>> searchRecipes(String query);
}

/// Comment Repository Interface
abstract class ICommentRepository {
  ResultFuture<List<Comment>> getComments(String recipeId);

  ResultFuture<Comment> addComment({
    required String recipeId,
    required String content,
    String? parentId,
  });

  ResultFuture<void> addReaction({
    required String commentId,
    required String emoji,
  });

  ResultFuture<void> removeReaction({
    required String commentId,
    required String emoji,
  });
}

/// Hub Repository Interface
abstract class IHubRepository {
  ResultFuture<List<Hub>> getAllHubs();

  ResultFuture<List<Hub>> getSubscribedHubs();

  ResultFuture<void> subscribeHub(String hubId);

  ResultFuture<void> unsubscribeHub(String hubId);
}
