// Dependency Injection - Service Locator
// Design Pattern: Dependency Injection (Inversion of Control)
// SOLID: Dependency Inversion Principle

import 'package:get_it/get_it.dart';
import '../domain/repositories/recipe_repository.dart';
import '../domain/usecases/recipe_usecases.dart';
import '../data/repositories/recipe_repository_impl.dart';
import '../presentation/blocs/recipe_bloc.dart';

final sl = GetIt.instance;

Future<void> initDependencies() async {
  // ============ Features ============
  
  // BLoC
  sl.registerFactory(
    () => RecipeBloc(
      getRecipesUseCase: sl(),
      getFeaturedRecipesUseCase: sl(),
      getTrendingRecipesUseCase: sl(),
      searchRecipesUseCase: sl(),
    ),
  );

  // Use Cases
  sl.registerLazySingleton(() => GetRecipesUseCase(sl()));
  sl.registerLazySingleton(() => GetFeaturedRecipesUseCase(sl()));
  sl.registerLazySingleton(() => GetTrendingRecipesUseCase(sl()));
  sl.registerLazySingleton(() => GetRecipeByIdUseCase(sl()));
  sl.registerLazySingleton(() => LikeRecipeUseCase(sl()));
  sl.registerLazySingleton(() => SaveRecipeUseCase(sl()));
  sl.registerLazySingleton(() => SearchRecipesUseCase(sl()));

  // ============ Repositories ============
  sl.registerLazySingleton<IRecipeRepository>(() => RecipeRepository());

  // ============ External ============
  // Здесь в будущем: Dio, SharedPreferences, etc.
}
