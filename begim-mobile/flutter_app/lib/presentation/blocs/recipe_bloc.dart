// Presentation Layer - BLoC (Business Logic Component)
// Design Pattern: Observer Pattern + State Pattern
// SOLID: Single Responsibility (только управление состоянием)

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../domain/entities/recipe.dart';
import '../../domain/usecases/recipe_usecases.dart';

// Events
abstract class RecipeEvent extends Equatable {
  const RecipeEvent();

  @override
  List<Object?> get props => [];
}

class LoadRecipes extends RecipeEvent {
  final String? hubId;
  final String? tag;
  final RecipeType? type;

  const LoadRecipes({this.hubId, this.tag, this.type});

  @override
  List<Object?> get props => [hubId, tag, type];
}

class LoadFeaturedRecipes extends RecipeEvent {}

class LoadTrendingRecipes extends RecipeEvent {}

class RefreshRecipes extends RecipeEvent {}

class SearchRecipes extends RecipeEvent {
  final String query;

  const SearchRecipes(this.query);

  @override
  List<Object?> get props => [query];
}

class LoadMoreRecipes extends RecipeEvent {}

// States
abstract class RecipeState extends Equatable {
  const RecipeState();

  @override
  List<Object> get props => [];
}

class RecipeInitial extends RecipeState {}

class RecipeLoading extends RecipeState {}

class RecipeLoaded extends RecipeState {
  final List<Recipe> recipes;
  final bool hasMore;
  final int currentPage;

  const RecipeLoaded({
    required this.recipes,
    this.hasMore = true,
    this.currentPage = 1,
  });

  @override
  List<Object> get props => [recipes, hasMore, currentPage];

  RecipeLoaded copyWith({
    List<Recipe>? recipes,
    bool? hasMore,
    int? currentPage,
  }) {
    return RecipeLoaded(
      recipes: recipes ?? this.recipes,
      hasMore: hasMore ?? this.hasMore,
      currentPage: currentPage ?? this.currentPage,
    );
  }
}

class RecipeError extends RecipeState {
  final String message;

  const RecipeError(this.message);

  @override
  List<Object> get props => [message];
}

// BLoC
class RecipeBloc extends Bloc<RecipeEvent, RecipeState> {
  final GetRecipesUseCase getRecipesUseCase;
  final GetFeaturedRecipesUseCase getFeaturedRecipesUseCase;
  final GetTrendingRecipesUseCase getTrendingRecipesUseCase;
  final SearchRecipesUseCase searchRecipesUseCase;

  RecipeBloc({
    required this.getRecipesUseCase,
    required this.getFeaturedRecipesUseCase,
    required this.getTrendingRecipesUseCase,
    required this.searchRecipesUseCase,
  }) : super(RecipeInitial()) {
    on<LoadRecipes>(_onLoadRecipes);
    on<LoadFeaturedRecipes>(_onLoadFeatured);
    on<LoadTrendingRecipes>(_onLoadTrending);
    on<RefreshRecipes>(_onRefresh);
    on<SearchRecipes>(_onSearch);
    on<LoadMoreRecipes>(_onLoadMore);
  }

  Future<void> _onLoadRecipes(
    LoadRecipes event,
    Emitter<RecipeState> emit,
  ) async {
    emit(RecipeLoading());

    final result = await getRecipesUseCase(
      hubId: event.hubId,
      tag: event.tag,
      type: event.type,
    );

    result.fold(
      (failure) => emit(RecipeError(failure.message)),
      (recipes) => emit(RecipeLoaded(
        recipes: recipes,
        hasMore: recipes.length >= 20,
      )),
    );
  }

  Future<void> _onLoadFeatured(
    LoadFeaturedRecipes event,
    Emitter<RecipeState> emit,
  ) async {
    emit(RecipeLoading());

    final result = await getFeaturedRecipesUseCase();

    result.fold(
      (failure) => emit(RecipeError(failure.message)),
      (recipes) => emit(RecipeLoaded(recipes: recipes)),
    );
  }

  Future<void> _onLoadTrending(
    LoadTrendingRecipes event,
    Emitter<RecipeState> emit,
  ) async {
    final result = await getTrendingRecipesUseCase();

    result.fold(
      (failure) => emit(RecipeError(failure.message)),
      (recipes) => emit(RecipeLoaded(recipes: recipes)),
    );
  }

  Future<void> _onRefresh(
    RefreshRecipes event,
    Emitter<RecipeState> emit,
  ) async {
    add(const LoadRecipes());
  }

  Future<void> _onSearch(
    SearchRecipes event,
    Emitter<RecipeState> emit,
  ) async {
    emit(RecipeLoading());

    final result = await searchRecipesUseCase(event.query);

    result.fold(
      (failure) => emit(RecipeError(failure.message)),
      (recipes) => emit(RecipeLoaded(recipes: recipes, hasMore: false)),
    );
  }

  Future<void> _onLoadMore(
    LoadMoreRecipes event,
    Emitter<RecipeState> emit,
  ) async {
    final currentState = state;
    if (currentState is! RecipeLoaded || !currentState.hasMore) return;

    final nextPage = currentState.currentPage + 1;
    final result = await getRecipesUseCase(page: nextPage);

    result.fold(
      (failure) => emit(RecipeError(failure.message)),
      (newRecipes) => emit(currentState.copyWith(
        recipes: [...currentState.recipes, ...newRecipes],
        currentPage: nextPage,
        hasMore: newRecipes.length >= 20,
      )),
    );
  }
}
