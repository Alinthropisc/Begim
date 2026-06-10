import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/begim_colors.dart';
import '../../../core/models/models.dart';
import '../../../core/models/cart_state.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';

/// Shopping cart screen
class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

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
    final items = ref.watch(cartProvider);
    final cartNotifier = ref.read(cartProvider.notifier);

    return Scaffold(
      backgroundColor: BegimColors.cream,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Savatcha',
                          style: GoogleFonts.cormorantGaramond(
                            fontSize: 28,
                            fontWeight: FontWeight.w600,
                            color: BegimColors.ink,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${items.length} ta mahsulot',
                          style: const TextStyle(
                            fontSize: 13,
                            color: BegimColors.inkMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (items.isNotEmpty)
                    TextButton(
                      onPressed: () => cartNotifier.clear(),
                      child: const Text(
                        'Tozalash',
                        style: TextStyle(
                          color: BegimColors.bordeaux,
                          fontSize: 13,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // Cart items
            Expanded(
              child: items.isEmpty
                  ? _EmptyCart()
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: items.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final item = items[index];
                        return _CartItemWidget(
                          item: item,
                          onIncrease: () => cartNotifier.updateQuantity(
                              item.product.id, item.quantity + 1),
                          onDecrease: () => cartNotifier.updateQuantity(
                              item.product.id, item.quantity - 1),
                          onRemove: () =>
                              cartNotifier.removeItem(item.product.id),
                          formatPrice: _formatPrice,
                        );
                      },
                    ),
            ),
            // Checkout
            if (items.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: BegimColors.white,
                  border: Border(
                    top: BorderSide(color: BegimColors.divider),
                  ),
                ),
                child: SafeArea(
                  top: false,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Jami:',
                            style: TextStyle(
                              fontSize: 16,
                              color: BegimColors.inkMuted,
                            ),
                          ),
                          Text(
                            _formatPrice(cartNotifier.totalPrice),
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: BegimColors.bordeaux,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Buyurtma qabul qilindi! ✨'),
                              backgroundColor: BegimColors.emerald,
                            ),
                          );
                          cartNotifier.clear();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: BegimColors.bordeaux,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'Buyurtma berish',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
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

class _EmptyCart extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: BegimColors.creamDark,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.shopping_bag_outlined,
              size: 48,
              color: BegimColors.inkLight,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Savatcha bo\'sh',
            style: GoogleFonts.cormorantGaramond(
              fontSize: 22,
              fontWeight: FontWeight.w600,
              color: BegimColors.ink,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Katalogdan shirinliklarni tanlang',
            style: TextStyle(
              fontSize: 14,
              color: BegimColors.inkMuted,
            ),
          ),
        ],
      ),
    );
  }
}

class _CartItemWidget extends StatelessWidget {
  final CartItem item;
  final VoidCallback onIncrease;
  final VoidCallback onDecrease;
  final VoidCallback onRemove;
  final String Function(double) formatPrice;

  const _CartItemWidget({
    required this.item,
    required this.onIncrease,
    required this.onDecrease,
    required this.onRemove,
    required this.formatPrice,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: BegimColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: BegimColors.gold.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          // Image
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: CachedNetworkImage(
              imageUrl: item.product.imageUrl,
              width: 70,
              height: 70,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(width: 12),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.product.name,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: BegimColors.ink,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  item.product.sellerName,
                  style: const TextStyle(
                    fontSize: 11,
                    color: BegimColors.inkMuted,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    // Quantity controls
                    Container(
                      decoration: BoxDecoration(
                        color: BegimColors.cream,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _QtyBtn(icon: Icons.remove, onTap: onDecrease),
                          SizedBox(
                            width: 28,
                            child: Text(
                              '${item.quantity}',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                color: BegimColors.ink,
                              ),
                            ),
                          ),
                          _QtyBtn(icon: Icons.add, onTap: onIncrease),
                        ],
                      ),
                    ),
                    const Spacer(),
                    Text(
                      formatPrice(item.totalPrice),
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: BegimColors.bordeaux,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QtyBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _QtyBtn({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 28,
        height: 28,
        alignment: Alignment.center,
        child: Icon(
          icon,
          size: 16,
          color: BegimColors.bordeaux,
        ),
      ),
    );
  }
}
