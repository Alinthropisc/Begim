import 'package:flutter/material.dart';
import '../../../core/theme/begim_colors.dart';
import '../../../shared/widgets/patterns.dart';
import 'package:google_fonts/google_fonts.dart';

/// User profile screen
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BegimColors.cream,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Header with pattern
            SliverToBoxAdapter(
              child: Container(
                height: 220,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      BegimColors.bordeaux,
                      BegimColors.bordeauxDark,
                    ],
                  ),
                ),
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: IslamicPattern(
                        color: BegimColors.gold,
                        opacity: 0.15,
                      ),
                    ),
                    Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 90,
                            height: 90,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: BegimColors.cream,
                              border: Border.all(
                                color: BegimColors.gold,
                                width: 3,
                              ),
                            ),
                            child: const Icon(
                              Icons.person_rounded,
                              size: 50,
                              color: BegimColors.bordeaux,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Mehmon',
                            style: GoogleFonts.cormorantGaramond(
                              fontSize: 24,
                              fontWeight: FontWeight.w600,
                              color: BegimColors.cream,
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            '+998 ** *** ** **',
                            style: TextStyle(
                              fontSize: 13,
                              color: BegimColors.goldLight,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Stats
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: BegimColors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: BegimColors.gold.withOpacity(0.2),
                  ),
                ),
                child: Row(
                  children: const [
                    _StatItem(count: '12', label: 'Buyurtmalar'),
                    _StatItem(count: '8', label: 'Sevimlilar'),
                    _StatItem(count: '3', label: 'Sharhlar'),
                  ],
                ),
              ),
            ),
            // Menu items
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Mening',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: BegimColors.ink,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _MenuItem(
                      icon: Icons.receipt_long_rounded,
                      title: 'Buyurtmalarim',
                      subtitle: 'Tarixni ko\'rish',
                      onTap: () {},
                    ),
                    _MenuItem(
                      icon: Icons.favorite_rounded,
                      title: 'Sevimlilar',
                      subtitle: '8 ta mahsulot',
                      onTap: () {},
                    ),
                    _MenuItem(
                      icon: Icons.location_on_rounded,
                      title: 'Manzillarim',
                      subtitle: 'Yetkazib berish manzili',
                      onTap: () {},
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Sozlamalar',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: BegimColors.ink,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _MenuItem(
                      icon: Icons.language_rounded,
                      title: 'Til',
                      subtitle: 'O\'zbek',
                      onTap: () {},
                    ),
                    _MenuItem(
                      icon: Icons.notifications_rounded,
                      title: 'Bildirishnomalar',
                      subtitle: 'Yoqilgan',
                      onTap: () {},
                    ),
                    _MenuItem(
                      icon: Icons.help_outline_rounded,
                      title: 'Yordam',
                      subtitle: 'FAQ va qo\'llab-quvvatlash',
                      onTap: () {},
                    ),
                    _MenuItem(
                      icon: Icons.info_outline_rounded,
                      title: 'Ilova haqida',
                      subtitle: 'v1.0.0',
                      onTap: () {},
                    ),
                    const SizedBox(height: 16),
                    // Seller CTA
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: BegimColors.bordeaux,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.storefront_rounded,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text(
                                  'Sotuvchi bo\'lish',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                ),
                                Text(
                                  'O\'z shirinliklaringizni soting',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: BegimColors.goldLight,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Icon(
                            Icons.arrow_forward_ios_rounded,
                            color: Colors.white,
                            size: 18,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
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

class _StatItem extends StatelessWidget {
  final String count;
  final String label;

  const _StatItem({required this.count, required this.label});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(
            count,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: BegimColors.bordeaux,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: BegimColors.inkMuted,
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: BegimColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: BegimColors.divider),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: BegimColors.cream,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: BegimColors.bordeaux, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: BegimColors.ink,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: BegimColors.inkMuted,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              color: BegimColors.inkLight,
            ),
          ],
        ),
      ),
    );
  }
}
