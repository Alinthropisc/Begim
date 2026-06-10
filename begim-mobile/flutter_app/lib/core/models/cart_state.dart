import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/models.dart';
import '../../data/mock_data.dart';

/// Cart state notifier
class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);

  void addItem(Product product) {
    final existingIndex =
        state.indexWhere((item) => item.product.id == product.id);
    if (existingIndex >= 0) {
      final updated = [...state];
      updated[existingIndex].quantity += 1;
      state = updated;
    } else {
      state = [...state, CartItem(product: product)];
    }
  }

  void removeItem(String productId) {
    state = state.where((item) => item.product.id != productId).toList();
  }

  void updateQuantity(String productId, int quantity) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    final updated = [...state];
    final index = updated.indexWhere((item) => item.product.id == productId);
    if (index >= 0) {
      updated[index] = CartItem(product: updated[index].product, quantity: quantity);
      state = updated;
    }
  }

  void clear() {
    state = [];
  }

  int get itemCount => state.fold(0, (sum, item) => sum + item.quantity);

  double get totalPrice =>
      state.fold(0, (sum, item) => sum + item.totalPrice);
}

final cartProvider =
    StateNotifierProvider<CartNotifier, List<CartItem>>((ref) {
  return CartNotifier();
});

/// Favorites state
class FavoritesNotifier extends StateNotifier<Set<String>> {
  FavoritesNotifier() : super({});

  void toggle(String productId) {
    final newState = {...state};
    if (newState.contains(productId)) {
      newState.remove(productId);
    } else {
      newState.add(productId);
    }
    state = newState;
  }

  bool isFavorite(String productId) => state.contains(productId);
}

final favoritesProvider =
    StateNotifierProvider<FavoritesNotifier, Set<String>>((ref) {
  return FavoritesNotifier();
});
