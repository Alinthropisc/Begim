import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/begim_colors.dart';
import '../../../core/models/models.dart';
import '../../../core/models/cart_state.dart';
import '../../../data/mock_data.dart';
import '../../../shared/widgets/patterns.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';

/// Product detail screen
class ProductDetailScreen extends ConsumerWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

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
    final product = MockData.getProductById(productId);
    if (product == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Mahsulot topilmadi'),
              TextButton(
                onPressed: () => context.go('/home'),
                child: const Text('Bosh sahifa'),
              ),
            ],
          ),
        ),
      );
    }

    final isFav = ref.watch(favoritesProvider).contains(product.id);

    return Scaffold(
      backgroundColor: BegimColors.cream,
      body: Stack(
        children: [
          // Main content
          CustomScrollView(
            slivers: [
              // Hero image
              SliverAppBar(
                expandedHeight: 380,
                pinned: true,
                backgroundColor: BegimColors.cream,
                leading: _FloatingBtn(
                  icon: Icons.arrow_back_rounded,
                  onTap: () => context.pop(),
                ),
                actions: [
                  _FloatingBtn(
                    icon: isFav
                        ? Icons.favorite_rounded
                        : Icons.favorite_outline_rounded,
                    onTap: () => ref
                        .read(favoritesProvider.notifier)
                        .toggle(product.id),
                    color: isFav ? BegimColors.bordeaux : null,
                  ),
                  const SizedBox(width: 8),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: CachedNetworkImage(
                    imageUrl: product.imageUrl,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              // Info card
              SliverToBoxAdapter(
                child: Container(
                  margin: const EdgeInsets.fromLTRB(16, -24, 16, 0),
                  decoration: BoxDecoration(
                    color: BegimColors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: BegimColors.gold.withOpacity(0.2),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Badges
                            Row(
                              children: [
                                if (product.isHalol)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: BegimColors.emerald
                                          .withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(Icons.verified_rounded,
                                            size: 14,
                                            color: BegimColors.emerald),
                                        SizedBox(width: 4),
                                        Text(
                                          'Halol',
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                            color: BegimColors.emerald,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                const SizedBox(width: 8),
                                if (product.isNew)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: BegimColors.bordeaux
                                          .withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Text(
                                      'YANGI',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: BegimColors.bordeaux,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            // Title
                            Text(
                              product.name,
                              style: GoogleFonts.cormorantGaramond(
                                fontSize: 28,
                                fontWeight: FontWeight.w600,
                                color: BegimColors.ink,
                              ),
                            ),
                            const SizedBox(height: 4),
                            // Rating
                            Row(
                              children: [
                                Icon(
                                  Icons.star_rounded,
                                  size: 18,
                                  color: BegimColors.gold,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  product.rating.toStringAsFixed(1),
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: BegimColors.ink,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  '(${product.reviewsCount} ta sharh)',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: BegimColors.inkMuted,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            // Seller
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: BegimColors.cream,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: 22,
                                    backgroundColor: BegimColors.creamDark,
                                    backgroundImage:
                                        CachedNetworkImageProvider(
                                            product.sellerAvatar),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'Sotuvchi',
                                          style: TextStyle(
                                            fontSize: 11,
                                            color: BegimColors.inkMuted,
                                          ),
                                        ),
                                        Text(
                                          product.sellerName,
                                          style: const TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w600,
                                            color: BegimColors.ink,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Icon(
                                    Icons.arrow_forward_ios_rounded,
                                    color: BegimColors.inkMuted,
                                    size: 18,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                            // Description
                            const Text(
                              'Tavsif',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: BegimColors.ink,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              product.description,
                              style: const TextStyle(
                                fontSize: 14,
                                color: BegimColors.ink,
                                height: 1.5,
                              ),
                            ),
                            const SizedBox(height: 100), // Space for bottom CTA
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          // Bottom CTA
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: BegimColors.white,
                border: Border(
                  top: BorderSide(color: BegimColors.divider),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SafeArea(
                top: false,
                child: Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'Narxi',
                          style: TextStyle(
                            fontSize: 12,
                            color: BegimColors.inkMuted,
                          ),
                        ),
                        Text(
                          _formatPrice(product.price),
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: BegimColors.bordeaux,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          ref.read(cartProvider.notifier).addItem(product);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('${product.name} qo\'shildi ✨'),
                              backgroundColor: BegimColors.emerald,
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        },
                        icon: const Icon(Icons.shopping_bag_rounded),
                        label: const Text('Savatga'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: BegimColors.bordeaux,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FloatingBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final Color? color;

  const _FloatingBtn({
    required this.icon,
    required this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.all(8),
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
            ),
          ],
        ),
        child: Icon(
          icon,
          color: color ?? BegimColors.ink,
          size: 20,
        ),
      ),
    );
  }
}
