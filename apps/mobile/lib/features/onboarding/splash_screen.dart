import 'dart:async';

import 'package:flutter/material.dart';

import '../../app/app_theme.dart';
import '../../core/widgets/rhino_brand.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({required this.onComplete, super.key});

  final VoidCallback onComplete;

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer(const Duration(milliseconds: 1050), widget.onComplete);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RhinoColors.rhinoBlue,
      body: Stack(
        children: [
          const Positioned(
            left: -92,
            top: -72,
            child: Opacity(
              opacity: .11,
              child: RhinoBrandMark(
                size: 280,
                backgroundColor: null,
                markColor: RhinoColors.brandCloud,
              ),
            ),
          ),
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const RhinoBrandMark(
                  size: 86,
                  backgroundColor: RhinoColors.brandCloud,
                  markColor: RhinoColors.rhinoBlue,
                  borderRadius: BorderRadius.all(Radius.circular(30)),
                ),
                const SizedBox(height: 22),
                const RhinoWordmark(light: true, markSize: 0, fontSize: 34),
                const SizedBox(height: 14),
                Text(
                  'Trusted bookings for local experiences',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFFDDE6EA)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
