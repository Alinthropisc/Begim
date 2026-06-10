// Data Layer - Repository Implementations
// SOLID: Dependency Inversion (реализация зависит от абстракции)
// Design Pattern: Repository Pattern + Strategy Pattern (remote/local)

import 'package:dartz/dartz.dart';
import '../../domain/entities/recipe.dart';
import '../../domain/entities/comment.dart';
import '../../domain/entities/hub.dart';
import '../../domain/entities/failure.dart';
import '../../domain/repositories/recipe_repository.dart';

/// Recipe Repository Implementation
class RecipeRepository implements IRecipeRepository {
  // В будущем: RemoteDataSource + LocalDataSource (кэш)
  // Сейчас: Mock данные

  @override
  ResultFuture<List<Recipe>> getRecipes({
    String? hubId,
    String? tag,
    RecipeType? type,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      // TODO: Заменить на API вызов
      await Future.delayed(const Duration(milliseconds: 500)); // Симуляция сети
      
      var recipes = _mockRecipes;
      
      // Фильтрация
      if (hubId != null) {
        recipes = recipes.where((r) => r.hub == hubId).toList();
      }
      if (tag != null) {
        recipes = recipes.where((r) => r.tags.contains(tag)).toList();
      }
      if (type != null) {
        recipes = recipes.where((r) => r.type == type).toList();
      }

      // Пагинация
      final start = (page - 1) * limit;
      final end = start + limit;
      if (start >= recipes.length) return Right([]);
      
      return Right(recipes.sublist(start, end.clamp(0, recipes.length)));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  ResultFuture<Recipe> getRecipeById(String id) async {
    try {
      await Future.delayed(const Duration(milliseconds: 300));
      final recipe = _mockRecipes.firstWhere((r) => r.id == id);
      return Right(recipe);
    } catch (e) {
      return Left(ServerFailure('Recipe not found'));
    }
  }

  @override
  ResultFuture<List<Recipe>> getFeaturedRecipes() async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      return Right(_mockRecipes.where((r) => r.isFeatured).toList());
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  ResultFuture<List<Recipe>> getTrendingRecipes({int limit = 10}) async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      final trending = List<Recipe>.from(_mockRecipes)
        ..sort((a, b) => b.likesCount.compareTo(a.likesCount));
      return Right(trending.take(limit).toList());
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  ResultFuture<Recipe> createRecipe(Recipe recipe) async {
    try {
      await Future.delayed(const Duration(seconds: 1));
      // TODO: Отправить на сервер
      return Right(recipe);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  ResultFuture<void> likeRecipe(String recipeId) async {
    try {
      await Future.delayed(const Duration(milliseconds: 200));
      // TODO: API call
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  ResultFuture<void> saveRecipe(String recipeId) async {
    try {
      await Future.delayed(const Duration(milliseconds: 200));
      // TODO: API call
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  ResultFuture<List<Recipe>> searchRecipes(String query) async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      final results = _mockRecipes
          .where((r) =>
              r.title.toLowerCase().contains(query.toLowerCase()) ||
              r.description.toLowerCase().contains(query.toLowerCase()) ||
              r.tags.any((t) => t.toLowerCase().contains(query.toLowerCase())))
          .toList();
      return Right(results);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}

// Mock данные (временные)
final _mockRecipes = <Recipe>[
  Recipe(
    id: 'r1',
    title: 'Medovik — klassik retsept',
    description:
        'Klassik medovik retsepti — asal bilan pishirilgan nozik qatlamlar va qaymoqli krem. Bu retsept mening buvimdan qolgan va 50 yildan ortiq vaqt davomida oilamizda tayyorlanadi.',
    authorId: 'u1',
    authorName: 'Dilnoza opa',
    authorAvatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
    ingredients: [
      'Un — 500g',
      'Asal — 3 osh qoshiq',
      'Tuxum — 3 dona',
      'Shakar — 200g',
      'Sariyog\' — 200g',
      'Soda — 1 choy qoshiq',
    ],
    steps: [
      'Asal va shakarni suv hammomida eritib oling',
      'Tuxum va sodani qo\'shib aralashtiring',
      'Unni asta-sekin qo\'shib xamir qoring',
      'Xamirni 8 qismga bo\'ling va yupqa qilib yoying',
      'Har bir qatlamni 180°C da 5-7 daqiqa pishiring',
      'Qaymoqli krem tayyorlang',
      'Qatlamlarni krem bilan surting',
      '6 soat sovutgichda tursin',
    ],
    imageUrl:
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
    tags: ['tort', 'medovik', 'klassik', 'bayram'],
    hub: 'tortlar',
    createdAt: DateTime.now().subtract(const Duration(hours: 5)),
    likesCount: 342,
    commentsCount: 67,
    savesCount: 128,
    cookingTime: 120,
    difficulty: 3,
    isFeatured: true,
    type: RecipeType.tutorial,
  ),
  Recipe(
    id: 'r2',
    title: 'Chak-chak: milliy shirinlik',
    description:
        'Chak-chak — bu nafaqat shirinlik, balki mehr va mehr ramzi. Har bir bo\'lagida ota-bobolarimiz an\'analari mujassam.',
    authorId: 'u2',
    authorName: 'Gulnora xola',
    authorAvatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    ingredients: [
      'Un — 600g',
      'Tuxum — 5 dona',
      'Asal — 300g',
      'Shakar — 100g',
      'O\'simlik moyi — 500ml',
    ],
    steps: [
      'Tuxumni ko\'pirtiring',
      'Unni qo\'shib qattiq xamir qoring',
      '30 daqiqa dam oldiring',
      'Yupqa qilib yoying va ingichka chiziqlar kesing',
      'Qizdirilgan moyda qizartiring',
      'Asal va shakarni qaynatib sirop tayyorlang',
      'Qovurilgan xamirni siropga aralashtiring',
      'Shakl berib sovuting',
    ],
    imageUrl:
        'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800',
    tags: ['milliy', 'chak-chak', 'to\'y', 'bayram'],
    hub: 'milliy-shirinliklar',
    createdAt: DateTime.now().subtract(const Duration(days: 1)),
    likesCount: 521,
    commentsCount: 89,
    savesCount: 234,
    cookingTime: 90,
    difficulty: 2,
    isFeatured: true,
    type: RecipeType.post,
  ),
  Recipe(
    id: 'r3',
    title: '🔥 CHALLENGE: Eng yaxshi paxlava!',
    description:
        'Bu hafta biz eng yaxshi paxlava retseptini aniqlaymiz! O\'z retseptingizni ulashing va 100 000 so\'m yutuqni qo\'lga kiriting!',
    authorId: 'system',
    authorName: 'Begim Jamoa',
    authorAvatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=begim',
    ingredients: ['Paxlava uchun kerakli masalliqlar'],
    steps: [
      'O\'z paxlava retseptingizni tayyorlang',
      'Rasmga oling va retsept bilan ulashing',
      '#PaxlavaChallenge teg qo\'ying',
      'Do\'stlaringizni taklif qiling (ovoz berish uchun)',
    ],
    imageUrl:
        'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800',
    tags: ['challenge', 'paxlava', 'musobaqa'],
    hub: 'challenges',
    createdAt: DateTime.now().subtract(const Duration(hours: 2)),
    likesCount: 1203,
    commentsCount: 234,
    savesCount: 456,
    cookingTime: 180,
    difficulty: 4,
    isFeatured: true,
    type: RecipeType.challenge,
  ),
];
