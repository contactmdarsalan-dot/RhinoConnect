import 'package:flutter/material.dart';

import '../../app/app_theme.dart';
import '../models/models.dart';
import 'remote_image.dart';

class ServiceCard extends StatelessWidget {
  const ServiceCard({
    required this.service,
    required this.onTap,
    super.key,
  });

  final ServiceListing service;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final preview = service.cover?.thumbnailUrl ?? service.cover?.url;

    return Semantics(
      button: true,
      label: 'Open ${service.title}',
      child: InkWell(
        borderRadius: BorderRadius.circular(28),
        onTap: onTap,
        child: Ink(
          decoration: BoxDecoration(
            color: RhinoColors.card,
            borderRadius: BorderRadius.circular(28),
            boxShadow: const [BoxShadow(color: Color(0x12062B22), blurRadius: 20, offset: Offset(0, 10))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                child: AspectRatio(
                  aspectRatio: 1.35,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      if (preview == null) Container(color: RhinoColors.mist) else RemoteImage(url: preview),
                      const DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [Color(0x00071811), Color(0x99071811)],
                          ),
                        ),
                      ),
                      Positioned(
                        left: 14,
                        top: 14,
                        child: _Tag(label: service.provider.country),
                      ),
                      Positioned(
                        right: 14,
                        bottom: 14,
                        child: _Rating(label: '${service.provider.rating}'),
                      ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: Text(service.title, style: Theme.of(context).textTheme.titleLarge)),
                        const SizedBox(width: 12),
                        Text(service.priceLabel, style: Theme.of(context).textTheme.titleMedium),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(service.locationLabel, style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        _Pill(icon: Icons.schedule_rounded, label: service.durationLabel),
                        const SizedBox(width: 8),
                        _Pill(icon: Icons.people_alt_rounded, label: '${service.capacity} guests'),
                        const SizedBox(width: 8),
                        _Pill(icon: Icons.photo_library_outlined, label: '${service.media.length} media'),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: RhinoColors.brandCloud.withValues(alpha: .92),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(label.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: .9)),
    );
  }
}

class _Rating extends StatelessWidget {
  const _Rating({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: RhinoColors.pine,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.star_rounded, size: 16, color: RhinoColors.lime),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(color: RhinoColors.brandCloud, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Flexible(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: RhinoColors.muted,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: RhinoColors.pine),
            const SizedBox(width: 5),
            Flexible(
              child: Text(
                label,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: RhinoColors.ink),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
