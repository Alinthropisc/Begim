/// Product model
class Product {
  final String id;
  final String name;
  final String nameRu;
  final String description;
  final double price;
  final String imageUrl;
  final String category;
  final String sellerName;
  final String sellerAvatar;
  final double rating;
  final int reviewsCount;
  final bool isHalol;
  final bool isNew;

  const Product({
    required this.id,
    required this.name,
    required this.nameRu,
    required this.description,
    required this.price,
    required this.imageUrl,
    required this.category,
    required this.sellerName,
    required this.sellerAvatar,
    this.rating = 5.0,
    this.reviewsCount = 0,
    this.isHalol = true,
    this.isNew = false,
  });
}

/// Story model
class Story {
  final String id;
  final String sellerName;
  final String sellerAvatar;
  final List<String> images;
  final bool isViewed;

  const Story({
    required this.id,
    required this.sellerName,
    required this.sellerAvatar,
    required this.images,
    this.isViewed = false,
  });
}

/// Category model
class Category {
  final String id;
  final String name;
  final String icon;

  const Category({
    required this.id,
    required this.name,
    required this.icon,
  });
}

/// Community post model
class CommunityPost {
  final String id;
  final String authorName;
  final String authorAvatar;
  final String title;
  final String content;
  final String? imageUrl;
  final int likesCount;
  final int commentsCount;
  final DateTime createdAt;
  final bool isLiked;

  const CommunityPost({
    required this.id,
    required this.authorName,
    required this.authorAvatar,
    required this.title,
    required this.content,
    this.imageUrl,
    this.likesCount = 0,
    this.commentsCount = 0,
    required this.createdAt,
    this.isLiked = false,
  });
}

/// Cart item model
class CartItem {
  final Product product;
  int quantity;

  CartItem({
    required this.product,
    this.quantity = 1,
  });

  double get totalPrice => product.price * quantity;
}
