import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/begim_colors.dart';
import '../../../data/mock_data.dart';
import '../../../shared/widgets/product_card.dart';

/// Catalog screen with filtering
class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  String _selectedCategory = 'all';
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final categories = MockData.categories;
    final allProducts = MockData.getProductsByCategory(_selectedCategory);

    return Scaffold(
      backgroundColor: BegimColors.cream,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Katalog',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w600,
                      color: BegimColors.ink,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${allProducts.length} ta mahsulot',
                    style: const TextStyle(
                      fontSize: 13,
                      color: BegimColors.inkMuted,
                    ),
                  ),
                ],
              ),
            ),
            // Search
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Container(
                decoration: BoxDecoration(
                  color: BegimColors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: BegimColors.divider),
                ),
                child: TextField(
                  controller: _searchController,
                  decoration: const InputDecoration(
                    hintText: 'Qidirish...',
                    border: InputBorder.none,
                    prefixIcon: Icon(Icons.search_rounded,
                        color: BegimColors.inkMuted),
                    hintStyle: TextStyle(
                      color: BegimColors.inkLight,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ),
            // Categories chips
            SizedBox(
              height: 44,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final cat = categories[index];
                  final isSelected = cat.id == _selectedCategory;
                  return GestureDetector(
                    onTap: () {
                      setState(() => _selectedCategory = cat.id);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? BegimColors.bordeaux
                            : BegimColors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected
                              ? BegimColors.bordeaux
                              : BegimColors.divider,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            cat.icon,
                            style: const TextStyle(fontSize: 16),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            cat.name,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: isSelected
                                  ? Colors.white
                                  : BegimColors.ink,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 8),
            // Products grid
            Expanded(
              child: allProducts.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.search_off,
                              size: 64, color: BegimColors.inkLight),
                          const SizedBox(height: 16),
                          const Text(
                            'Mahsulot topilmadi',
                            style: TextStyle(
                              fontSize: 16,
                              color: BegimColors.inkMuted,
                            ),
                          ),
                        ],
                      ),
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.all(16),
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 0.68,
                      ),
                      itemCount: allProducts.length,
                      itemBuilder: (context, index) {
                        final product = allProducts[index];
                        return ProductCard(
                          product: product,
                          onTap: () => context.go('/product/${product.id}'),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
