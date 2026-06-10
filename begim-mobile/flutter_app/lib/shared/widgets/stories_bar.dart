import 'package:flutter/material.dart';
import '../../core/theme/begim_colors.dart';
import '../../core/models/models.dart';
import 'package:cached_network_image/cached_network_image.dart';

/// Instagram-style story bar at top of home screen
class StoriesBar extends StatelessWidget {
  final List<Story> stories;
  final Function(Story)? onStoryTap;

  const StoriesBar({
    super.key,
    required this.stories,
    this.onStoryTap,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: stories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final story = stories[index];
          final isFirst = index == 0 && story.sellerAvatar.isEmpty;
          return _StoryItem(
            story: story,
            isAddNew: isFirst,
            onTap: () => onStoryTap?.call(story),
          );
        },
      ),
    );
  }
}

class _StoryItem extends StatelessWidget {
  final Story story;
  final bool isAddNew;
  final VoidCallback? onTap;

  const _StoryItem({
    required this.story,
    this.isAddNew = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 72,
        child: Column(
          children: [
            Container(
              width: 68,
              height: 68,
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: isAddNew
                    ? null
                    : const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          BegimColors.bordeaux,
                          BegimColors.gold,
                        ],
                      ),
              ),
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: BegimColors.cream,
                ),
                child: CircleAvatar(
                  radius: 28,
                  backgroundColor: BegimColors.creamDark,
                  backgroundImage: isAddNew || story.sellerAvatar.isEmpty
                      ? null
                      : CachedNetworkImageProvider(story.sellerAvatar),
                  child: isAddNew
                      ? Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: BegimColors.bordeaux.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.add_rounded,
                            color: BegimColors.bordeaux,
                            size: 22,
                          ),
                        )
                      : story.sellerAvatar.isEmpty
                          ? const Icon(
                              Icons.person,
                              color: BegimColors.inkMuted,
                            )
                          : null,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              isAddNew ? 'Qo\'shish' : story.sellerName,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 11,
                color: BegimColors.ink,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
