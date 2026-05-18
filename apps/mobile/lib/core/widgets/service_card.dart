import 'package:flutter/material.dart';

import '../../app/app_theme.dart';
import '../models/models.dart';

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
    return Semantics(
      button: true,
      label: 'Open ${service.title}',
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: onTap,
        child: Ink(
          decoration: BoxDecoration(
            color: const Color(0xFFFBFCFA),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: RhinoColors.mist),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                child: AspectRatio(
                  aspectRatio: 1.55,
                  child: service.cover == null
                      ? Container(color: RhinoColors.mist)
                      : Image.network(service.cover!.thumbnailUrl ?? service.cover!.url, fit: BoxFit.cover),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(service.title, style: Theme.of(context).textTheme.titleMedium),
                        ),
                        Text(service.priceLabel, style: Theme.of(context).textTheme.titleMedium),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(service.locationLabel, style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _Pill(icon: Icons.star_rounded, label: '${service.provider.rating}'),
                        const SizedBox(width: 8),
                        _Pill(icon: Icons.schedule_rounded, label: service.durationLabel),
                        const SizedBox(width: 8),
                        _Pill(icon: Icons.people_alt_rounded, label: '${service.capacity}'),
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

class _Pill extends StatelessWidget {
  const _Pill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF3F0),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: RhinoColors.pine),
          const SizedBox(width: 5),
          Text(label, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: RhinoColors.ink)),
        ],
      ),
    );
  }
}
