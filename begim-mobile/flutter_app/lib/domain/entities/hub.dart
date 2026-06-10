import 'package:freezed_annotation/freezed_annotation.dart';

part 'hub.freezed.dart';

/// Hub (Категория) - как на Habr/TProger
@freezed
class Hub with _$Hub {
  const factory Hub({
    required String id,
    required String name,
    required String icon,
    required String description,
    required int subscribersCount,
    required int recipesCount,
    @Default(false) bool isSubscribed,
    @Default(HubType.general) HubType type,
  }) = _Hub;
}

enum HubType {
  general, // Общие рецепты
  professional, // Для профи
  challenge, // Челленджи
  masterclass, // Мастер-классы
}
