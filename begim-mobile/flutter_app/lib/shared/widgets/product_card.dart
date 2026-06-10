import 'package:flutter/material.dart';
import '../../core/theme/begim_colors.dart';
import '../../core/models/models.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/models/cart_state.dart';

/// Product card used in grid view
class ProductCard extends ConsumerWidget {
  final Product product;
  final VoidCallback? onTap;

  const ProductCard({
    super.key,
    required this.product,
    this.onTap,
  });

  String _formatPrice(double price) {
    final formatted = price.toInt().toString();
    final buffer = StringBuffer();
    for (var i = 0; i < formatted.length; i++) {
      buffer.write(formatted[i]);
      if ((formatted.length - i - 1) % 3 == 0 && i != formatted.length - 1) {
        buffer.write(' ');
      }
    }
    return '${buffer.toString()} so\'m';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isFav = ref.watch(favoritesProvider).contains(product.id);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: BegimColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: BegimColors.gold.withOpacity(0.2),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: BegimColors.ink.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image
            AspectRatio(
              aspectRatio: 1,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  CachedNetworkImage(
                    imageUrl: product.imageUrl,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      color: BegimColors.creamDark,
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: BegimColors.creamDark,
                      child: const Icon(Icons.bakery_dining,
                          color: BegimColors.bordeaux),
                    ),
                  ),
                  // Favorite button
                  Positioned(
                    right: 8,
                    top: 8,
                    child: GestureDetector(
                      onTap: () {
                        ref.read(favoritesProvider.notifier).toggle(product.id);
                      },
                      child: Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: BegimColors.white.withOpacity(0.95),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          isFav
                              ? Icons.favorite_rounded
                              : Icons.favorite_outline_rounded,
                          size: 18,
                          color: isFav
                              ? BegimColors.bordeaux
                              : BegimColors.inkMuted,
                        ),
                      ),
                    ),
                  ),
                  // Badges
                  if (product.isNew || product.isHalol)
                    Positioned(
                      left: 8,
                      top: 8,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (product.isNew)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: BegimColors.bordeaux,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'YANGI',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          if (product.isHalol) ...[
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: BegimColors.emerald,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'HALOL',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                ],
              ),
            ),
            // Info
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: BegimColors.ink,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      product.sellerName,
                      style: const TextStyle(
                        fontSize: 11,
                        color: BegimColors.inkMuted,
                      ),
                    ),
                    const Spacer(),
                    Row(
                      children: [
                        Icon(
                          Icons.star_rounded,
                          size: 14,
                          color: BegimColors.gold,
                        ),
                        const SizedBox(width: 2),
                        Text(
                          product.rating.toStringAsFixed(1),
                          style: const TextStyle(
                            fontSize: 11,
                            color: BegimColors.ink,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '(${product.reviewsCount})',
                          style: const TextStyle(
                            fontSize: 10,
                            color: BegimColors.inkMuted,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          _formatPrice(product.price),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: BegimColors.bordeaux,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
