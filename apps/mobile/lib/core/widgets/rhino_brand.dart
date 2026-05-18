import 'package:flutter/material.dart';

import '../../app/app_theme.dart';

class RhinoBrandMark extends StatelessWidget {
  const RhinoBrandMark({
    this.size = 48,
    this.backgroundColor = RhinoColors.rhinoBlue,
    this.markColor = RhinoColors.brandCloud,
    this.borderRadius,
    super.key,
  });

  final double size;
  final Color? backgroundColor;
  final Color markColor;
  final BorderRadius? borderRadius;

  @override
  Widget build(BuildContext context) {
    final child = CustomPaint(
      painter: _RhinoMarkPainter(markColor: markColor),
      size: Size.square(size),
    );

    if (backgroundColor == null) {
      return SizedBox.square(dimension: size, child: child);
    }

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: borderRadius ?? BorderRadius.circular(size * .26),
      ),
      child: child,
    );
  }
}

class RhinoWordmark extends StatelessWidget {
  const RhinoWordmark({
    this.light = false,
    this.markSize = 40,
    this.fontSize = 26,
    super.key,
  });

  final bool light;
  final double markSize;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    final rhinoColor = light ? RhinoColors.brandCloud : RhinoColors.rhinoBlue;
    final connectColor = light ? const Color(0xFFD8DDE2) : RhinoColors.connectSilver;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        RhinoBrandMark(
          size: markSize,
          backgroundColor: light ? RhinoColors.brandCloud : null,
          markColor: light ? RhinoColors.rhinoBlue : RhinoColors.rhinoBlue,
        ),
        SizedBox(width: markSize * .18),
        RichText(
          text: TextSpan(
            style: TextStyle(
              fontSize: fontSize,
              height: 1,
              letterSpacing: 0,
              fontWeight: FontWeight.w900,
              fontFamily: 'Roboto',
            ),
            children: [
              TextSpan(text: 'Rhino', style: TextStyle(color: rhinoColor)),
              TextSpan(text: 'Connect', style: TextStyle(color: connectColor)),
            ],
          ),
        ),
      ],
    );
  }
}

class _RhinoMarkPainter extends CustomPainter {
  const _RhinoMarkPainter({required this.markColor});

  final Color markColor;

  @override
  void paint(Canvas canvas, Size size) {
    final sx = size.width / 128;
    final sy = size.height / 128;
    Offset p(double x, double y) => Offset(x * sx, y * sy);

    final mark = Path()
      ..moveTo(p(18, 79.6).dx, p(18, 79.6).dy)
      ..cubicTo(p(21.4, 59.3).dx, p(21.4, 59.3).dy, p(36.7, 43.5).dx, p(36.7, 43.5).dy, p(58.2, 38.6).dx, p(58.2, 38.6).dy)
      ..lineTo(p(65.6, 21.8).dx, p(65.6, 21.8).dy)
      ..lineTo(p(79.8, 38.2).dx, p(79.8, 38.2).dy)
      ..cubicTo(p(89.2, 40.6).dx, p(89.2, 40.6).dy, p(97.8, 46.1).dx, p(97.8, 46.1).dy, p(105.2, 54.1).dx, p(105.2, 54.1).dy)
      ..lineTo(p(122, 49.4).dx, p(122, 49.4).dy)
      ..lineTo(p(108.8, 66.4).dx, p(108.8, 66.4).dy)
      ..cubicTo(p(110.7, 70.5).dx, p(110.7, 70.5).dy, p(112.1, 74.8).dx, p(112.1, 74.8).dy, p(113, 79.4).dx, p(113, 79.4).dy)
      ..lineTo(p(99.4, 79.9).dx, p(99.4, 79.9).dy)
      ..lineTo(p(91.9, 96.8).dx, p(91.9, 96.8).dy)
      ..lineTo(p(68.6, 101.6).dx, p(68.6, 101.6).dy)
      ..lineTo(p(50.3, 92.9).dx, p(50.3, 92.9).dy)
      ..lineTo(p(34.9, 99.2).dx, p(34.9, 99.2).dy)
      ..lineTo(p(31.2, 88.2).dx, p(31.2, 88.2).dy)
      ..close();

    canvas.drawPath(mark, Paint()..color = markColor);

    final fold = Path()
      ..moveTo(p(18, 79.6).dx, p(18, 79.6).dy)
      ..cubicTo(p(21.4, 59.3).dx, p(21.4, 59.3).dy, p(36.7, 43.5).dx, p(36.7, 43.5).dy, p(58.2, 38.6).dx, p(58.2, 38.6).dy)
      ..lineTo(p(50.3, 92.9).dx, p(50.3, 92.9).dy)
      ..lineTo(p(34.9, 99.2).dx, p(34.9, 99.2).dy)
      ..lineTo(p(31.2, 88.2).dx, p(31.2, 88.2).dy)
      ..close();
    canvas.drawPath(fold, Paint()..color = markColor.withValues(alpha: .82));

    final horn = Path()
      ..moveTo(p(79.8, 38.2).dx, p(79.8, 38.2).dy)
      ..cubicTo(p(91.4, 42).dx, p(91.4, 42).dy, p(99.4, 48.8).dx, p(99.4, 48.8).dy, p(105.2, 54.1).dx, p(105.2, 54.1).dy)
      ..lineTo(p(92.2, 58.3).dx, p(92.2, 58.3).dy)
      ..close();
    canvas.drawPath(horn, Paint()..color = markColor.withValues(alpha: .68));

    final eyeColor = markColor.computeLuminance() < .5 ? RhinoColors.brandCloud : RhinoColors.rhinoBlue;
    canvas.drawCircle(p(85, 62), size.width * .026, Paint()..color = eyeColor);
  }

  @override
  bool shouldRepaint(covariant _RhinoMarkPainter oldDelegate) {
    return oldDelegate.markColor != markColor;
  }
}
