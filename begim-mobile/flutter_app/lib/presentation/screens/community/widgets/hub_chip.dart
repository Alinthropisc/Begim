import 'package:flutter/material.dart';
import '../../../core/theme/begim_colors.dart';
import '../../../domain/entities/hub.dart';

/// Hub Chip — категория как на Habr
class HubChip extends StatelessWidget {
  final Hub hub;
  final VoidCallback? onTap;

  const HubChip({super.key, required this.hub, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 110,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: BegimColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: hub.isSubscribed ? BegimColors.bordeaux : BegimColors.divider,
            width: hub.isSubscribed ? 2 : 1,
          ),
          boxShadow: [
            if (hub.isSubscribed)
              BoxShadow(
                color: BegimColors.bordeaux.withOpacity(0.2),
                blurRadius: 8,
              ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(hub.icon, style: const TextStyle(fontSize: 26)),
            const SizedBox(height: 6),
            Text(
              hub.name,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: hub.isSubscribed ? BegimColors.bordeaux : BegimColors.ink,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              '${hub.recipesCount} retsept',
              style: const TextStyle(
                fontSize: 10,
                color: BegimColors.inkMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
