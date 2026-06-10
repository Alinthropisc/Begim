import 'package:flutter/material.dart';
import '../../../core/theme/begim_colors.dart';
import '../../../data/mock_data.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';

/// Community feed screen
class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  final likedPosts = <String>{};

  String _timeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inHours < 1) return 'Hozirgina';
    if (diff.inHours < 24) return '${diff.inHours} soat oldin';
    if (diff.inDays < 7) return '${diff.inDays} kun oldin';
    return '${diff.inDays ~/ 7} hafta oldin';
  }

  @override
  Widget build(BuildContext context) {
    final posts = MockData.communityPosts;

    return Scaffold(
      backgroundColor: BegimColors.cream,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
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
                          const SizedBox(height: 4),
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
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: BegimColors.bordeaux,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.add_rounded,
                              color: Colors.white, size: 18),
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
                  ],
                ),
              ),
            ),
            SliverList.separated(
              itemCount: posts.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final post = posts[index];
                final isLiked = likedPosts.contains(post.id);
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: BegimColors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: BegimColors.gold.withOpacity(0.2),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Author
                      Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 20,
                              backgroundColor: BegimColors.creamDark,
                              backgroundImage: CachedNetworkImageProvider(
                                  post.authorAvatar),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    post.authorName,
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: BegimColors.ink,
                                    ),
                                  ),
                                  Text(
                                    _timeAgo(post.createdAt),
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: BegimColors.inkMuted,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.more_horiz_rounded,
                                  color: BegimColors.inkMuted),
                              onPressed: () {},
                            ),
                          ],
                        ),
                      ),
                      // Content
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              post.title,
                              style: GoogleFonts.cormorantGaramond(
                                fontSize: 20,
                                fontWeight: FontWeight.w600,
                                color: BegimColors.ink,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              post.content,
                              style: const TextStyle(
                                fontSize: 14,
                                color: BegimColors.ink,
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Image
                      if (post.imageUrl != null) ...[
                        const SizedBox(height: 12),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            child: CachedNetworkImage(
                              imageUrl: post.imageUrl!,
                              fit: BoxFit.cover,
                              height: 220,
                            ),
                          ),
                        ),
                      ],
                      // Actions
                      Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            _ActionBtn(
                              icon: isLiked
                                  ? Icons.favorite_rounded
                                  : Icons.favorite_outline_rounded,
                              label: '${post.likesCount + (isLiked ? 1 : 0)}',
                              color: isLiked
                                  ? BegimColors.bordeaux
                                  : BegimColors.inkMuted,
                              onTap: () {
                                setState(() {
                                  if (isLiked) {
                                    likedPosts.remove(post.id);
                                  } else {
                                    likedPosts.add(post.id);
                                  }
                                });
                              },
                            ),
                            const SizedBox(width: 20),
                            _ActionBtn(
                              icon: Icons.chat_bubble_outline_rounded,
                              label: '${post.commentsCount}',
                              color: BegimColors.inkMuted,
                              onTap: () {},
                            ),
                            const SizedBox(width: 20),
                            _ActionBtn(
                              icon: Icons.share_outlined,
                              label: 'Ulashish',
                              color: BegimColors.inkMuted,
                              onTap: () {},
                            ),
                            const Spacer(),
                            IconButton(
                              icon: const Icon(Icons.bookmark_border_rounded,
                                  color: BegimColors.inkMuted),
                              onPressed: () {},
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionBtn({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 13,
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
