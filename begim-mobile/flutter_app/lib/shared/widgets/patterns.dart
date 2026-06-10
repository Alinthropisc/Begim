import 'package:flutter/material.dart';
import '../../core/theme/begim_colors.dart';

/// Islamic geometric pattern as a decorative background
class IslamicPattern extends StatelessWidget {
  final double size;
  final Color color;
  final double opacity;

  const IslamicPattern({
    super.key,
    this.size = 40,
    this.color = BegimColors.gold,
    this.opacity = 0.15,
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _IslamicPatternPainter(
        size: size,
        color: color.withOpacity(opacity),
      ),
      child: const SizedBox.expand(),
    );
  }
}

class _IslamicPatternPainter extends CustomPainter {
  final double size;
  final Color color;

  _IslamicPatternPainter({
    required this.size,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size canvasSize) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    final cols = (canvasSize.width / size).ceil() + 1;
    final rows = (canvasSize.height / size).ceil() + 1;

    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        final cx = col * size + size / 2;
        final cy = row * size + size / 2;
        _drawStar(canvas, cx, cy, size / 2, paint);
      }
    }
  }

  void _drawStar(Canvas canvas, double cx, double cy, double r, Paint paint) {
    // 8-pointed star (Rub el Hizb)
    final path = Path();
    for (var i = 0; i < 8; i++) {
      final angle = (i * 45) * 3.14159 / 180;
      final x = cx + r * 0.8 * _cos(angle);
      final y = cy + r * 0.8 * _sin(angle);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    canvas.drawPath(path, paint);

    // Inner rotated square
    final path2 = Path();
    for (var i = 0; i < 4; i++) {
      final angle = (i * 90 + 45) * 3.14159 / 180;
      final x = cx + r * 0.55 * _cos(angle);
      final y = cy + r * 0.55 * _sin(angle);
      if (i == 0) {
        path2.moveTo(x, y);
      } else {
        path2.lineTo(x, y);
      }
    }
    path2.close();
    canvas.drawPath(path2, paint);
  }

  double _cos(double rad) {
    double sum = 0, term = 1;
    for (var i = 1; i <= 10; i++) {
      sum += term;
      term *= -rad * rad / ((2 * i) * (2 * i + 1));
    }
    return sum;
  }

  double _sin(double rad) {
    double sum = 0, term = rad;
    for (var i = 1; i <= 10; i++) {
      sum += term;
      term *= -rad * rad / ((2 * i + 1) * (2 * i + 2));
    }
    return sum;
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Decorative divider with ornamental center
class OrnamentalDivider extends StatelessWidget {
  const OrnamentalDivider({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 1,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    BegimColors.gold.withOpacity(0),
                    BegimColors.gold.withOpacity(0.5),
                  ],
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Icon(
              Icons.star_four_points_rounded,
              color: BegimColors.gold,
              size: 14,
            ),
          ),
          Expanded(
            child: Container(
              height: 1,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    BegimColors.gold.withOpacity(0.5),
                    BegimColors.gold.withOpacity(0),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
