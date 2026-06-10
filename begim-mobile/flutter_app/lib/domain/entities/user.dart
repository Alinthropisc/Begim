import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';

/// User Entity с Karma системой
@freezed
class User with _$User {
  const factory User({
    required String id,
    required String name,
    required String avatar,
    required String phone,
    String? bio,
    @Default(0) int karma, // Репутация как на Habr
    @Default(UserLevel.beginner) UserLevel level,
    @Default(0) int recipesCount,
    @Default(0) int followersCount,
    @Default(0) int followingCount,
    @Default(<String>[]) List<String> badges, // Достижения
    @Default(false) isVerifiedSeller,
    @Default(false) isTopAuthor,
  }) = _User;
}

/// Уровни пользователей (геймификация)
enum UserLevel {
  beginner('Boshlovchi', 0, '🌱'),
  amateur('Havaskor', 100, '🍪'),
  professional('Professional', 500, '👨‍🍳'),
  expert('Ekspert', 2000, '⭐'),
  master('Usta', 5000, '🏆');

  final String title;
  final int requiredKarma;
  final String icon;

  const UserLevel(this.title, this.requiredKarma, this.icon);
}
