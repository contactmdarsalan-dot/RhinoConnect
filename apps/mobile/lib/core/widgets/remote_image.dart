import 'package:flutter/material.dart';

import '../../app/app_theme.dart';

class RemoteImage extends StatelessWidget {
  const RemoteImage({
    required this.url,
    this.fit = BoxFit.cover,
    this.icon = Icons.image_outlined,
    super.key,
  });

  final String url;
  final BoxFit fit;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Image.network(
      url,
      fit: fit,
      errorBuilder: (context, error, stackTrace) {
        return Container(
          color: RhinoColors.muted,
          alignment: Alignment.center,
          child: Icon(icon, color: RhinoColors.slate, size: 34),
        );
      },
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return Container(
          color: RhinoColors.muted,
          alignment: Alignment.center,
          child: const SizedBox(
            width: 22,
            height: 22,
            child: CircularProgressIndicator(strokeWidth: 2, color: RhinoColors.pine),
          ),
        );
      },
    );
  }
}
