import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/begim_colors.dart';
import '../../../domain/entities/recipe.dart';

/// Killer Feature Card — для челленджей и промо-контента
/// 
/// Большой, яркий, привлекающий внимание кард для:
/// - Челленджей (с призовым фондом)
/// - Master-klass анонсов
/// - "Bugungi menyu" (меню дня)
/// - "Bayram buyurtmasi" (предзаказ на праздник)
class KillerFeatureCard extends StatelessWidget {
  final Recipe recipe;
  final VoidCallback? onTap;

  const KillerFeatureCard({super.key, required this.recipe, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              BegimColors.bordeaux,
              BegimColors.bordeauxDark,
            ],
          ),
          boxShadow: [
            BoxShadow(
              color: BegimColors.bordeaux.withOpacity(0.4),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            // Background image
            if (recipe.imageUrl.isNotEmpty)
              Positioned.fill(
                child: Opacity(
                  opacity: 0.3,
                  child: CachedNetworkImage(
                    imageUrl: recipe.imageUrl,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            // Pattern overlay
            Positioned.fill(
              child: CustomPaint(
                painter: _PatternPainter(),
              ),
            ),
            // Content
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: BegimColors.gold,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('🏆', style: TextStyle(fontSize: 14)),
                        SizedBox(width: 4),
                        Text(
                          'HAFTANING CHALLENGI',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Title
                  Text(
                    recipe.title,
                    style: GoogleFonts.cormorantGaramond(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      height: 1.1,
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Prize
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: BegimColors.gold.withOpacity(0.5)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('💰', style: TextStyle(fontSize: 20)),
                        const SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Yutuq fondi',
                              style: TextStyle(
                                color: BegimColors.goldLight,
                                fontSize: 11,
                              ),
                            ),
                            Text(
                              '100 000 so\'m',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Participants & CTA
                  Row(
                    children: [
                      // Avatars
                      SizedBox(
                        width: 60,
                        height: 28,
                        child: Stack(
                          children: [
                            _miniAvatar('https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100', 0),
                            _miniAvatar('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', 1),
                            _miniAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', 2),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        '+234 ishtirokchi',
                        style: TextStyle(
                          color: BegimColors.goldLight,
                          fontSize: 12,
                        ),
                      ),
                      const Spacer(),
                      // CTA
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: BegimColors.gold,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Ishtirok etish',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(width: 4),
                            Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 16),
                          ],
                        ),
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

  Widget _miniAvatar(String url, int index) {
    return Positioned(
      left: index * 18.0,
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: BegimColors.bordeaux, width: 2),
        ),
        child: CircleAvatar(
          backgroundImage: CachedNetworkImageProvider(url),
        ),
      ),
    );
  }
}

/// Декоративный паттерн
class _PatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = BegimColors.gold.withOpacity(0.08)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    // Рисуем несколько 8-конечных звёзд
    for (var i = 0; i < 3; i++) {
      final x = size.width - 50 - i * 80.0;
      final y = 50 + i * 30.0;
      _drawStar(canvas, x, y, 30, paint);
    }
  }

  void _drawStar(Canvas canvas, double cx, double cy, double r, Paint paint) {
    final path = Path();
    for (var i = 0; i < 8; i++) {
      final angle = (i * 45) * 3.14159 / 180;
      final x = cx + r * _cos(angle);
      final y = cy + r * _sin(angle);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    canvas.drawPath(path, paint);
  }

  double _cos(double r) => r == 0 ? 1 : (1 - r*r/2 + r*r*r*r/24);
  double _sin(double r) => r - r*r*r/6 + r*r*r*r*r/120;

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
