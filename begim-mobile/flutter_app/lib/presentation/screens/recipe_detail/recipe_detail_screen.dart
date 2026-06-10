import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/begim_colors.dart';
import '../../../domain/entities/recipe.dart';
import '../../../domain/entities/comment.dart';

/// Recipe Detail Screen — с комментариями и emoji реакциями
/// 
/// Фичи:
/// - Полный рецепт с ингредиентами и шагами
/// - Комментарии с threading (ответы)
/// - Emoji реакции (как в Telegram)
/// - Karma автора
/// - Поделиться / Сохранить / Boost
class RecipeDetailScreen extends StatefulWidget {
  final String recipeId;

  const RecipeDetailScreen({super.key, required this.recipeId});

  @override
  State<RecipeDetailScreen> createState() => _RecipeDetailScreenState();
}

class _RecipeDetailScreenState extends State<RecipeDetailScreen> {
  bool _isSaved = false;
  bool _showReactions = false;
  final Map<String, int> _reactions = {
    '❤️': 42,
    '🔥': 18,
    '👏': 7,
    '⭐': 12,
  };

  // Mock comments
  final List<Comment> _comments = [
    Comment(
      id: 'c1',
      recipeId: 'r1',
      authorId: 'u3',
      authorName: 'Mohira',
      authorAvatar:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200',
      content: 'Shu retseptni bugun tayyorladim! Juda mazali chiqdi 😍 Rahmat!',
      createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      reactions: {'❤️': 12, '🔥': 5},
      karma: 3,
    ),
    Comment(
      id: 'c2',
      recipeId: 'r1',
      authorId: 'u4',
      authorName: 'Nodira',
      authorAvatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
      content: 'Asal o\'rniga shakar ishlatsa bo\'ladimi? 🤔',
      createdAt: DateTime.now().subtract(const Duration(hours: 5)),
      reactions: {'🤔': 2},
      karma: 1,
      replies: [
        Comment(
          id: 'c2-1',
          recipeId: 'r1',
          authorId: 'u1',
          authorName: 'Dilnoza opa',
          authorAvatar:
              'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
          content:
              'Ha, ishlatsa bo\'ladi, lekin ta\'mi farq qiladi. Asal qo\'shsangiz ayniqsa mazali bo\'ladi! 🍯',
          createdAt: DateTime.now().subtract(const Duration(hours: 4)),
          reactions: {'❤️': 8, '👏': 3},
          karma: 5,
        ),
      ],
    ),
    Comment(
      id: 'c3',
      recipeId: 'r1',
      authorId: 'u5',
      authorName: 'Sevara',
      authorAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      content: 'Mening buvim ham shunday tayyorlardilar. Bolalikni eslatdi 🥺💕',
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      reactions: {'❤️': 24, '😢': 3},
      karma: 8,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    // TODO: Загрузить через BLoC
    final recipe = _mockRecipe;

    return Scaffold(
      backgroundColor: BegimColors.cream,
      body: CustomScrollView(
        slivers: [
          // Hero image with app bar
          SliverAppBar(
            expandedHeight: 350,
            pinned: true,
            backgroundColor: BegimColors.cream,
            leading: _FloatingBtn(
              icon: Icons.arrow_back_rounded,
              onTap: () => Navigator.pop(context),
            ),
            actions: [
              _FloatingBtn(
                icon: _isSaved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                onTap: () => setState(() => _isSaved = !_isSaved),
                color: _isSaved ? BegimColors.bordeaux : null,
              ),
              const SizedBox(width: 4),
              _FloatingBtn(
                icon: Icons.share_outlined,
                onTap: () {
                  HapticFeedback.mediumImpact();
                },
              ),
              const SizedBox(width: 8),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  CachedNetworkImage(
                    imageUrl: recipe.imageUrl,
                    fit: BoxFit.cover,
                  ),
                  // Gradient
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.6),
                        ],
                        stops: const [0.6, 1.0],
                      ),
                    ),
                  ),
                  // Type badge
                  Positioned(
                    top: 100,
                    left: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: BegimColors.emerald,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('🎓', style: TextStyle(fontSize: 14)),
                          SizedBox(width: 4),
                          Text(
                            'Master-klass',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  // Bottom info
                  Positioned(
                    left: 16,
                    right: 16,
                    bottom: 20,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Hub tag
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.white.withOpacity(0.3)),
                          ),
                          child: const Text(
                            '🎂 Tortlar',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          recipe.title,
                          style: GoogleFonts.cormorantGaramond(
                            fontSize: 32,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            height: 1.1,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Author card
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: BegimColors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: BegimColors.gold.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  Stack(
                    children: [
                      CircleAvatar(
                        radius: 26,
                        backgroundColor: BegimColors.creamDark,
                        backgroundImage: CachedNetworkImageProvider(recipe.authorAvatar),
                      ),
                      // Verified
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          width: 18,
                          height: 18,
                          decoration: BoxDecoration(
                            color: BegimColors.bordeaux,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(Icons.check_rounded, color: Colors.white, size: 10),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              recipe.authorName,
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: BegimColors.ink,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: BegimColors.emerald.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                '⭐ Usta',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: BegimColors.emerald,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Karma: 2 341 · 23 retsept',
                          style: const TextStyle(
                            fontSize: 12,
                            color: BegimColors.inkMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Follow button
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: BegimColors.bordeaux,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      '+ Obuna',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Recipe info
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Meta info
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: BegimColors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: BegimColors.gold.withOpacity(0.2)),
                    ),
                    child: Row(
                      children: [
                        _MetaItem(icon: '⏱️', label: 'Vaqt', value: '${recipe.cookingTime.toInt()} min'),
                        _Divider(),
                        _MetaItem(icon: '📊', label: 'Qiyinlik', value: '${recipe.difficulty}/5'),
                        _Divider(),
                        _MetaItem(icon: '🍽️', label: 'Portsiya', value: '8 kishi'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Description
                  Text(
                    'Tavsif',
                    style: GoogleFonts.cormorantGaramond(
                      fontSize: 22,
                      fontWeight: FontWeight.w600,
                      color: BegimColors.ink,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    recipe.description,
                    style: const TextStyle(
                      fontSize: 14,
                      color: BegimColors.ink,
                      height: 1.6,
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Ingredients
                  Text(
                    'Kerakli masalliqlar',
                    style: GoogleFonts.cormorantGaramond(
                      fontSize: 22,
                      fontWeight: FontWeight.w600,
                      color: BegimColors.ink,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: BegimColors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: BegimColors.gold.withOpacity(0.2)),
                    ),
                    child: Column(
                      children: recipe.ingredients.asMap().entries.map((e) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          child: Row(
                            children: [
                              Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  color: BegimColors.cream,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Center(
                                  child: Text(
                                    '${e.key + 1}',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: BegimColors.bordeaux,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  e.value,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: BegimColors.ink,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Steps
                  Text(
                    'Tayyorlash bosqichlari',
                    style: GoogleFonts.cormorantGaramond(
                      fontSize: 22,
                      fontWeight: FontWeight.w600,
                      color: BegimColors.ink,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...recipe.steps.asMap().entries.map((e) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: BegimColors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: BegimColors.gold.withOpacity(0.2)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: const BoxDecoration(
                              color: BegimColors.bordeaux,
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                '${e.key + 1}',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                e.value,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: BegimColors.ink,
                                  height: 1.5,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                  const SizedBox(height: 20),

                  // Reactions (как в Telegram)
                  _ReactionsBar(
                    reactions: _reactions,
                    showPicker: _showReactions,
                    onTogglePicker: () => setState(() => _showReactions = !_showReactions),
                    onReact: (emoji) {
                      setState(() {
                        _reactions[emoji] = (_reactions[emoji] ?? 0) + 1;
                        _showReactions = false;
                      });
                      HapticFeedback.lightImpact();
                    },
                  ),
                  const SizedBox(height: 24),

                  // Comments section
                  Text(
                    'Sharhlar (${_comments.length})',
                    style: GoogleFonts.cormorantGaramond(
                      fontSize: 22,
                      fontWeight: FontWeight.w600,
                      color: BegimColors.ink,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ..._comments.map((c) => _CommentWidget(comment: c)).toList(),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),

      // Bottom action bar
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: BegimColors.white,
          border: Border(top: BorderSide(color: BegimColors.divider)),
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
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: BegimColors.cream,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Text(
                    'Sharh yozish...',
                    style: TextStyle(
                      fontSize: 14,
                      color: BegimColors.inkMuted,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Boost button (Killer Feature)
              Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [BegimColors.gold, BegimColors.goldLight],
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: BegimColors.gold.withOpacity(0.4),
                      blurRadius: 10,
                    ),
                  ],
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(24),
                    onTap: () {
                      HapticFeedback.mediumImpact();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('🚀 Boost faollashtirildi!'),
                          backgroundColor: BegimColors.bordeaux,
                        ),
                      );
                    },
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('🚀', style: TextStyle(fontSize: 18)),
                          SizedBox(width: 4),
                          Text(
                            'Boost',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Mock recipe для примера
final _mockRecipe = Recipe(
  id: 'r1',
  title: 'Medovik — klassik retsept',
  description:
      'Klassik medovik retsepti — asal bilan pishirilgan nozik qatlamlar va qaymoqli krem. Bu retsept mening buvimdan qolgan va 50 yildan ortiq vaqt davomida oilamizda tayyorlanadi. Har bir qatlam sevgi bilan pishiriladi.',
  authorId: 'u1',
  authorName: 'Dilnoza opa',
  authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
  ingredients: [
    'Un — 500g',
    'Asal — 3 osh qoshiq',
    'Tuxum — 3 dona',
    'Shakar — 200g',
    'Sariyog\' — 200g',
    'Soda — 1 choy qoshiq',
  ],
  steps: [
    'Asal va shakarni suv hammomida eritib oling',
    'Tuxum va sodani qo\'shib aralashtiring',
    'Unni asta-sekin qo\'shib xamir qoring',
    'Xamirni 8 qismga bo\'ling va yupqa qilib yoying',
    'Har bir qatlamni 180°C da 5-7 daqiqa pishiring',
    'Qaymoqli krem tayyorlang',
    'Qatlamlarni krem bilan surting',
    '6 soat sovutgichda tursin',
  ],
  imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
  tags: ['tort', 'medovik', 'klassik'],
  hub: 'tortlar',
  createdAt: DateTime.now().subtract(const Duration(hours: 5)),
  likesCount: 342,
  commentsCount: 67,
  savesCount: 128,
  cookingTime: 120,
  difficulty: 3,
  isFeatured: true,
  type: RecipeType.tutorial,
);

/// Meta item
class _MetaItem extends StatelessWidget {
  final String icon;
  final String label;
  final String value;

  const _MetaItem({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(icon, style: const TextStyle(fontSize: 20)),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 11, color: BegimColors.inkMuted),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: BegimColors.ink,
            ),
          ),
        ],
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 40,
      color: BegimColors.divider,
    );
  }
}

/// Reactions Bar (как в Telegram)
class _ReactionsBar extends StatelessWidget {
  final Map<String, int> reactions;
  final bool showPicker;
  final VoidCallback onTogglePicker;
  final ValueChanged<String> onReact;

  const _ReactionsBar({
    required this.reactions,
    required this.showPicker,
    required this.onTogglePicker,
    required this.onReact,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            ...reactions.entries.map((e) => _ReactionChip(
              emoji: e.key,
              count: e.value,
              onTap: () => onReact(e.key),
            )),
            // Add reaction button
            GestureDetector(
              onTap: onTogglePicker,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: BegimColors.cream,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: BegimColors.divider),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('😊', style: TextStyle(fontSize: 16)),
                    SizedBox(width: 4),
                    Icon(Icons.add_rounded, size: 16, color: BegimColors.inkMuted),
                  ],
                ),
              ),
            ),
          ],
        ),
        // Emoji picker
        if (showPicker) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: BegimColors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: BegimColors.divider),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                ),
              ],
            ),
            child: Wrap(
              spacing: 8,
              children: Reaction.all.map((emoji) {
                return GestureDetector(
                  onTap: () => onReact(emoji),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: BegimColors.cream,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(emoji, style: const TextStyle(fontSize: 24)),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ],
    );
  }
}

class _ReactionChip extends StatelessWidget {
  final String emoji;
  final int count;
  final VoidCallback onTap;

  const _ReactionChip({
    required this.emoji,
    required this.count,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: BegimColors.bordeaux.withOpacity(0.08),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: BegimColors.bordeaux.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 18)),
            const SizedBox(width: 4),
            Text(
              '$count',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: BegimColors.bordeaux,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Comment widget с threading
class _CommentWidget extends StatelessWidget {
  final Comment comment;
  final int depth;

  const _CommentWidget({required this.comment, this.depth = 0});

  String _timeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m';
    if (diff.inHours < 24) return '${diff.inHours}h';
    return '${diff.inDays}d';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(
        left: depth * 16.0,
        bottom: 12,
      ),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: BegimColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border(
          left: depth > 0
              ? BorderSide(color: BegimColors.gold.withOpacity(0.3), width: 2)
              : BorderSide.none,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Author
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: BegimColors.creamDark,
                backgroundImage: CachedNetworkImageProvider(comment.authorAvatar),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          comment.authorName,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: BegimColors.ink,
                          ),
                        ),
                        if (comment.karma > 2) ...[
                          const SizedBox(width: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                            decoration: BoxDecoration(
                              color: BegimColors.gold.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '+${comment.karma}',
                              style: const TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: BegimColors.goldDark,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    Text(
                      _timeAgo(comment.createdAt),
                      style: const TextStyle(
                        fontSize: 11,
                        color: BegimColors.inkMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Content
          Text(
            comment.content,
            style: const TextStyle(
              fontSize: 14,
              color: BegimColors.ink,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 8),
          // Reactions
          if (comment.reactions.isNotEmpty)
            Wrap(
              spacing: 6,
              children: comment.reactions.entries.map((e) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: BegimColors.cream,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${e.key} ${e.value}',
                    style: const TextStyle(fontSize: 12),
                  ),
                );
              }).toList(),
            ),
          // Replies
          ...comment.replies.map((r) => Padding(
            padding: const EdgeInsets.only(top: 12),
            child: _CommentWidget(comment: r, depth: depth + 1),
          )),
        ],
      ),
    );
  }
}

/// Floating button
class _FloatingBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final Color? color;

  const _FloatingBtn({required this.icon, required this.onTap, this.color});

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
        child: Icon(icon, color: color ?? BegimColors.ink, size: 20),
      ),
    );
  }
}
