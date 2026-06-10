import 'package:freezed_annotation/freezed_annotation.dart';

part 'comment.freezed.dart';

/// Comment Entity с поддержкой threading и emoji реакций
@freezed
class Comment with _$Comment {
  const factory Comment({
    required String id,
    required String recipeId,
    required String authorId,
    required String authorName,
    required String authorAvatar,
    required String content,
    required DateTime createdAt,
    String? parentId, // Для threading
    @Default(<String, int>{}) Map<String, int> reactions, // emoji -> count
    @Default(<Comment>[]) List<Comment> replies,
    @Default(0) int karma, // Как на Habr
  }) = _Comment;
}

/// Emoji Reaction (как в Telegram)
class Reaction {
  static const heart = '❤️';
  static const fire = '🔥';
  static const clap = '👏';
  static const star = '⭐';
  static const laughing = '😂';
  static const surprised = '😮';
  static const sad = '😢';
  static const party = '🎉';
  
  static const all = [heart, fire, clap, star, laughing, surprised, sad, party];
}
