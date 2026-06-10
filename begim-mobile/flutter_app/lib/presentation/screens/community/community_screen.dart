import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/begim_colors.dart';
import '../../../domain/entities/recipe.dart';
import '../../../domain/entities/hub.dart';
import '../blocs/recipe_bloc.dart';
import 'widgets/recipe_card.dart';
import 'widgets/hub_chip.dart';
import 'widgets/killer_feature_card.dart';
import 'package:go_router/go_router.dart';

/// Community Screen — Уникальный формат: Habr + TProger + Instagram
/// 
/// Фичи:
/// - Хабы (категории) как на Habr
/// - Karma система для авторов
/// - Rich-контент (посты, туториалы, челленджи)
/// - Emoji реакции как в Telegram
/// - "Boost" для продвижения постов
/// - Закладки и сохранения
class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  RecipeType? _selectedType;

  final _hubs = const <Hub>[
    Hub(
      id: 'all',
      name: 'Barchasi',
      icon: '🌟',
      description: '',
      subscribersCount: 12500,
      recipesCount: 1240,
    ),
    Hub(
      id: 'tortlar',
      name: 'Tortlar',
      icon: '🎂',
      description: 'Tortlar va pirojnoe retseptlari',
      subscribersCount: 3400,
      recipesCount: 234,
      isSubscribed: true,
    ),
    Hub(
      id: 'milliy-shirinliklar',
      name: 'Milliy',
      icon: '🕌',
      description: 'Milliy shirinliklar',
      subscribersCount: 5600,
      recipesCount: 456,
      isSubscribed: true,
    ),
    Hub(
      id: 'challenges',
      name: 'Challenges',
      icon: '🏆',
      description: 'Musobaqalar va chellenjlar',
      subscribersCount: 8900,
      recipesCount: 45,
      type: HubType.challenge,
    ),
    Hub(
      id: 'masterclass',
      name: 'Master-klass',
      icon: '🎓',
      description: 'Professional darslar',
      subscribersCount: 2100,
      recipesCount: 89,
      type: HubType.masterclass,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    context.read<RecipeBloc>().add(const LoadRecipes());
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BegimColors.cream,
      body: SafeArea(
        child: NestedScrollView(
          headerSliverBuilder: (context, innerBoxIsScrolled) {
            return [
              // Header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Jamoa',
                              style: GoogleFonts.cormorantGaramond(
                                fontSize: 28,
                                fontWeight: FontWeight.w600,
                                color: BegimColors.ink,
                              ),
                            ),
                            const Text(
                              'Retseptlar, ilhom va do\'stlik',
                              style: TextStyle(
                                fontSize: 13,
                                color: BegimColors.inkMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Karma badge
                      _KarmaBadge(karma: 342),
                      const SizedBox(width: 8),
                      // Create button
                      _CreateButton(),
                    ],
                  ),
                ),
              ),
              // Hubs horizontal scroll
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 90,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _hubs.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 10),
                    itemBuilder: (context, i) => HubChip(hub: _hubs[i]),
                  ),
                ),
              ),
              // Tabs (filters)
              SliverPersistentHeader(
                pinned: true,
                delegate: _SliverTabBar(
                  TabBar(
                    controller: _tabController,
                    isScrollable: true,
                    labelColor: BegimColors.bordeaux,
                    unselectedLabelColor: BegimColors.inkMuted,
                    indicatorColor: BegimColors.bordeaux,
                    indicatorWeight: 3,
                    tabs: const [
                      Tab(text: '🔥 Trend'),
                      Tab(text: '✨ Yangi'),
                      Tab(text: '🎓 Master-klass'),
                      Tab(text: '🏆 Challenges'),
                    ],
                    onTap: (index) {
                      setState(() {
                        switch (index) {
                          case 0: _selectedType = null; break;
                          case 1: _selectedType = null; break;
                          case 2: _selectedType = RecipeType.tutorial; break;
                          case 3: _selectedType = RecipeType.challenge; break;
                        }
                      });
                      context.read<RecipeBloc>().add(LoadRecipes(type: _selectedType));
                    },
                  ),
                ),
              ),
            ];
          },
          body: TabBarView(
            controller: _tabController,
            children: [
              _buildRecipeList(),
              _buildRecipeList(),
              _buildRecipeList(),
              _buildRecipeList(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRecipeList() {
    return BlocBuilder<RecipeBloc, RecipeState>(
      builder: (context, state) {
        if (state is RecipeLoading) {
          return const Center(child: CircularProgressIndicator(color: BegimColors.bordeaux));
        }
        if (state is RecipeError) {
          return Center(child: Text(state.message));
        }
        if (state is RecipeLoaded) {
          return RefreshIndicator(
            color: BegimColors.bordeaux,
            onRefresh: () async {
              context.read<RecipeBloc>().add(RefreshRecipes());
            },
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: state.recipes.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final recipe = state.recipes[index];
                // Первый пост — всегда Challenge banner (если есть)
                if (index == 0 && recipe.type == RecipeType.challenge) {
                  return KillerFeatureCard(recipe: recipe);
                }
                return RecipeCard(
                  recipe: recipe,
                  onTap: () => context.go('/community/recipe/${recipe.id}'),
                );
              },
            ),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }
}

/// Karma badge (как на Habr)
class _KarmaBadge extends StatelessWidget {
  final int karma;
  const _KarmaBadge({required this.karma});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [BegimColors.gold, BegimColors.goldLight],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: BegimColors.gold.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('⭐', style: TextStyle(fontSize: 14)),
          const SizedBox(width: 4),
          Text(
            '$karma',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

/// Create button
class _CreateButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: BegimColors.bordeaux,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: BegimColors.bordeaux.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () {
            // TODO: Open create recipe screen
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('🚧 Retsept yaratish tez orada!'),
                backgroundColor: BegimColors.emerald,
              ),
            );
          },
          child: const Padding(
            padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.add_rounded, color: Colors.white, size: 18),
                SizedBox(width: 4),
                Text(
                  'Post',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Sliver tab bar delegate
class _SliverTabBar extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;

  _SliverTabBar(this.tabBar);

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: BegimColors.cream,
      child: tabBar,
    );
  }

  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  double get minExtent => tabBar.preferredSize.height;

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) => false;
}
