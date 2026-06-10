import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/begim_colors.dart';
import '../../../core/models/models.dart';
import '../../../data/mock_data.dart';
import '../../../shared/widgets/stories_bar.dart';
import '../../../shared/widgets/product_card.dart';
import '../../../shared/widgets/patterns.dart';
import 'package:google_fonts/google_fonts.dart';

/// Home screen — main landing of the app
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categories = MockData.categories;
    final products = MockData.products;
    final stories = MockData.stories;

    return Scaffold(
      backgroundColor: BegimColors.cream,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // App Bar
            SliverToBoxAdapter(
              child: _HomeHeader(),
            ),
            // Stories
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: StoriesBar(
                  stories: stories,
                  onStoryTap: (story) {
                    // TODO: open story viewer
                  },
                ),
              ),
            ),
            // Categories
            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Kategoriyalar',
                          style: GoogleFonts.cormorantGaramond(
                            fontSize: 22,
                            fontWeight: FontWeight.w600,
                            color: BegimColors.ink,
                          ),
                        ),
                        GestureDetector(
                          onTap: () => context.go('/catalog'),
                          child: const Text(
                            'Hammasi',
                            style: TextStyle(
                              fontSize: 13,
                              color: BegimColors.bordeaux,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 90,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: categories.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 12),
                      itemBuilder: (context, index) {
                        final cat = categories[index];
                        return _CategoryChip(category: cat);
                      },
                    ),
                  ),
                ],
              ),
            ),
            // Popular section
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Mashhur',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                        color: BegimColors.ink,
                      ),
                    ),
                    Text(
                      'Hammasi',
                      style: TextStyle(
                        fontSize: 13,
                        color: BegimColors.bordeaux,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Products grid
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.68,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final product = products[index];
                    return ProductCard(
                      product: product,
                      onTap: () => context.go('/product/${product.id}'),
                    );
                  },
                  childCount: products.length,
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }
}

class _HomeHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Logo
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: BegimColors.bordeaux,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: BegimColors.gold, width: 2),
                ),
                child: const Center(
                  child: Text('🥮', style: TextStyle(fontSize: 22)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Begim',
                      style: GoogleFonts.amiri(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: BegimColors.bordeaux,
                      ),
                    ),
                    const Text(
                      'Xush kelibsiz!',
                      style: TextStyle(
                        fontSize: 12,
                        color: BegimColors.inkMuted,
                      ),
                    ),
                  ],
                ),
              ),
              // Notifications
              _IconButton(
                icon: Icons.notifications_outlined,
                onTap: () {},
                badge: 2,
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Search bar
          Container(
            decoration: BoxDecoration(
              color: BegimColors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: BegimColors.divider),
            ),
            child: const Row(
              children: [
                SizedBox(width: 12),
                Icon(Icons.search_rounded, color: BegimColors.inkMuted),
                SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Shirinlik qidirish...',
                      border: InputBorder.none,
                      hintStyle: TextStyle(
                        color: BegimColors.inkLight,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
                Icon(Icons.tune_rounded, color: BegimColors.bordeaux),
                SizedBox(width: 12),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _IconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final int badge;

  const _IconButton({
    required this.icon,
    required this.onTap,
    this.badge = 0,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: BegimColors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: BegimColors.divider),
            ),
            child: Icon(icon, color: BegimColors.ink),
          ),
          if (badge > 0)
            Positioned(
              right: -2,
              top: -2,
              child: Container(
                width: 16,
                height: 16,
                decoration: const BoxDecoration(
                  color: BegimColors.bordeaux,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    '$badge',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  final Category category;

  const _CategoryChip({required this.category});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.go('/catalog'),
      child: SizedBox(
        width: 80,
        child: Column(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: BegimColors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: BegimColors.gold.withOpacity(0.3),
                  width: 1.5,
                ),
              ),
              child: Center(
                child: Text(
                  category.icon,
                  style: const TextStyle(fontSize: 28),
                ),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              category.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 12,
                color: BegimColors.ink,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
