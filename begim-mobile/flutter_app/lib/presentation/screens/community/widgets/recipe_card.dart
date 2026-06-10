import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/begim_colors.dart';
import '../../../domain/entities/recipe.dart';

/// Recipe Card — уникальный дизайн сообщества
/// 
/// Поддерживает:
/// - Обычные посты
/// - Мастер-классы (с видео)
/// - Челленджи (с акцентом на CTA)
class RecipeCard extends StatefulWidget {
  final Recipe recipe;
  final VoidCallback? onTap;

  const RecipeCard({super.key, required this.recipe, this.onTap});

  @override
  State<RecipeCard> createState() => _RecipeCardState();
}

class _RecipeCardState extends State<RecipeCard> {
  bool _isLiked = false;
  bool _isSaved = false;

  String _timeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 60) return '${diff.inMinutes} daqiqa oldin';
    if (diff.inHours < 24) return '${diff.inHours} soat oldin';
    if (diff.inDays < 7) return '${diff.inDays} kun oldin';
    return '${diff.inDays ~/ 7} hafta oldin';
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.recipe;
    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        decoration: BoxDecoration(
          color: BegimColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: BegimColors.gold.withOpacity(0.2)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 12,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            if (r.imageUrl.isNotEmpty)
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                child: Stack(
                  children: [
                    CachedNetworkImage(
                      imageUrl: r.imageUrl,
                      height: 200,
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                    // Type badge
                    Positioned(
                      top: 12,
                      left: 12,
                      child: _TypeBadge(type: r.type),
                    ),
                    // Difficulty
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.timer_outlined, color: Colors.white, size: 12),
                            const SizedBox(width: 4),
                            Text(
                              '${r.cookingTime.toInt()} min',
                              style: const TextStyle(color: Colors.white, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            // Content
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Author row
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundColor: BegimColors.creamDark,
                        backgroundImage: CachedNetworkImageProvider(r.authorAvatar),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  r.authorName,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: BegimColors.ink,
                                  ),
                                ),
                                if (r.authorId == 'u1') ...[
                                  const SizedBox(width: 4),
                                  const Icon(Icons.verified_rounded, size: 12, color: BegimColors.bordeaux),
                                ],
                              ],
                            ),
                            Text(
                              _timeAgo(r.createdAt),
                              style: const TextStyle(
                                fontSize: 11,
                                color: BegimColors.inkMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Karma
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: BegimColors.cream,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '⭐ ${124 + r.likesCount}',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: BegimColors.goldDark,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  // Title
                  Text(
                    r.title,
                    style: GoogleFonts.cormorantGaramond(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                      color: BegimColors.ink,
                      height: 1.2,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  // Description
                  Text(
                    r.description,
                    style: const TextStyle(
                      fontSize: 13,
                      color: BegimColors.inkMuted,
                      height: 1.4,
                    ),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 10),
                  // Tags
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: r.tags.take(4).map((tag) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: BegimColors.cream,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: BegimColors.divider),
                        ),
                        child: Text(
                          '#$tag',
                          style: const TextStyle(
                            fontSize: 11,
                            color: BegimColors.bordeaux,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 12),
                  // Actions
                  Row(
                    children: [
                      // Karma vote (как на Habr)
                      _KarmaVote(
                        initialCount: r.likesCount,
                        isLiked: _isLiked,
                        onToggle: () => setState(() => _isLiked = !_isLiked),
                      ),
                      const SizedBox(width: 16),
                      // Comments
                      _ActionItem(
                        icon: Icons.chat_bubble_outline_rounded,
                        count: r.commentsCount,
                      ),
                      const SizedBox(width: 16),
                      // Views
                      _ActionItem(
                        icon: Icons.visibility_outlined,
                        count: r.likesCount * 3,
                      ),
                      const Spacer(),
                      // Save
                      IconButton(
                        onPressed: () => setState(() => _isSaved = !_isSaved),
                        icon: Icon(
                          _isSaved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                          color: _isSaved ? BegimColors.bordeaux : BegimColors.inkMuted,
                        ),
                        constraints: const BoxConstraints(),
                        padding: EdgeInsets.zero,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Type badge
class _TypeBadge extends StatelessWidget {
  final RecipeType type;
  const _TypeBadge({required this.type});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    String icon;
    switch (type) {
      case RecipeType.tutorial:
        color = BegimColors.emerald;
        label = 'Master-klass';
        icon = '🎓';
        break;
      case RecipeType.challenge:
        color = BegimColors.bordeaux;
        label = 'Challenge';
        icon = '🏆';
        break;
      case RecipeType.post:
        color = BegimColors.gold;
        label = 'Retsept';
        icon = '📖';
        break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.4),
            blurRadius: 6,
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(icon, style: const TextStyle(fontSize: 12)),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

/// Karma vote (Habr-style up/down voting)
class _KarmaVote extends StatelessWidget {
  final int initialCount;
  final bool isLiked;
  final VoidCallback onToggle;

  const _KarmaVote({
    required this.initialCount,
    required this.isLiked,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isLiked ? BegimColors.bordeaux.withOpacity(0.1) : BegimColors.cream,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isLiked ? BegimColors.bordeaux : BegimColors.divider,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            onPressed: onToggle,
            icon: Icon(
              Icons.arrow_upward_rounded,
              size: 18,
              color: isLiked ? BegimColors.bordeaux : BegimColors.inkMuted,
            ),
            constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
            padding: EdgeInsets.zero,
          ),
          Text(
            '${initialCount + (isLiked ? 1 : 0)}',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isLiked ? BegimColors.bordeaux : BegimColors.ink,
            ),
          ),
          IconButton(
            onPressed: () {},
            icon: Icon(
              Icons.arrow_downward_rounded,
              size: 18,
              color: BegimColors.inkMuted,
            ),
            constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
            padding: EdgeInsets.zero,
          ),
        ],
      ),
    );
  }
}

/// Action item
class _ActionItem extends StatelessWidget {
  final IconData icon;
  final int count;

  const _ActionItem({required this.icon, required this.count});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: BegimColors.inkMuted),
        const SizedBox(width: 4),
        Text(
          '$count',
          style: const TextStyle(
            fontSize: 12,
            color: BegimColors.inkMuted,
          ),
        ),
      ],
    );
  }
}
