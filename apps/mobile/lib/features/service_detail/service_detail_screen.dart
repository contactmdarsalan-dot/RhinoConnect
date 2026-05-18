import 'package:flutter/material.dart';

import '../../app/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/widgets/rhino_surface.dart';
import '../booking/booking_screen.dart';
import '../media/media_preview_screen.dart';

class ServiceDetailScreen extends StatelessWidget {
  const ServiceDetailScreen({required this.service, super.key});

  final ServiceListing service;

  @override
  Widget build(BuildContext context) {
    final cover = service.cover;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 320,
            pinned: true,
            stretch: true,
            flexibleSpace: FlexibleSpaceBar(
              background: cover == null
                  ? Container(color: RhinoColors.mist)
                  : Image.network(cover.thumbnailUrl ?? cover.url, fit: BoxFit.cover),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 112),
            sliver: SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                Row(
                  children: [
                    Expanded(child: Text(service.title, style: Theme.of(context).textTheme.headlineMedium)),
                    const SizedBox(width: 12),
                    Text(service.priceLabel, style: Theme.of(context).textTheme.titleLarge),
                  ],
                ),
                const SizedBox(height: 8),
                Text(service.locationLabel, style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: RhinoColors.slate)),
                const SizedBox(height: 18),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _Fact(icon: Icons.star_rounded, text: '${service.provider.rating} (${service.provider.reviewCount})'),
                    _Fact(icon: Icons.schedule_rounded, text: service.durationLabel),
                    _Fact(icon: Icons.people_alt_rounded, text: 'Capacity ${service.capacity}'),
                    _Fact(icon: Icons.payments_outlined, text: '${service.depositPercent}% deposit'),
                  ],
                ),
                const SizedBox(height: 24),
                Text(service.description, style: Theme.of(context).textTheme.bodyLarge),
                const SizedBox(height: 24),
                const SectionHeader(title: 'Gallery'),
                SizedBox(
                  height: 126,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: service.media.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 10),
                    itemBuilder: (context, index) {
                      final media = service.media[index];
                      return _MediaTile(
                        media: media,
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => MediaPreviewScreen(media: service.media, initialIndex: index),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 24),
                const SectionHeader(title: 'What is included'),
                RhinoSurface(
                  padding: const EdgeInsets.all(6),
                  child: Column(
                    children: service.highlights
                        .map(
                          (item) => ListTile(
                            leading: const Icon(Icons.check_circle_rounded, color: RhinoColors.pine),
                            title: Text(item, style: Theme.of(context).textTheme.titleMedium),
                          ),
                        )
                        .toList(),
                  ),
                ),
                const SizedBox(height: 24),
                const SectionHeader(title: 'Provider'),
                RhinoSurface(
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 26,
                        backgroundColor: RhinoColors.sky,
                        child: Text(service.provider.name.substring(0, 1), style: const TextStyle(fontWeight: FontWeight.w900)),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Flexible(child: Text(service.provider.name, style: Theme.of(context).textTheme.titleMedium)),
                                if (service.provider.verified) ...[
                                  const SizedBox(width: 6),
                                  const Icon(Icons.verified_rounded, color: RhinoColors.pine, size: 18),
                                ],
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text('${service.provider.city}, ${service.provider.country}', style: Theme.of(context).textTheme.bodyMedium),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 16),
          child: ElevatedButton.icon(
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => BookingScreen(service: service)),
            ),
            icon: const Icon(Icons.calendar_month_rounded),
            label: const Text('Request booking'),
          ),
        ),
      ),
    );
  }
}

class _Fact extends StatelessWidget {
  const _Fact({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Chip(
      avatar: Icon(icon, size: 17, color: RhinoColors.pine),
      label: Text(text),
    );
  }
}

class _MediaTile extends StatelessWidget {
  const _MediaTile({required this.media, required this.onTap});

  final ServiceMedia media;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final preview = media.thumbnailUrl ?? media.url;

    return Semantics(
      button: true,
      label: 'Preview ${media.title}',
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: onTap,
        child: Ink(
          width: 160,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            image: DecorationImage(image: NetworkImage(preview), fit: BoxFit.cover),
          ),
          child: Stack(
            children: [
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(22),
                    gradient: const LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0x000B1B22), Color(0x990B1B22)],
                    ),
                  ),
                ),
              ),
              if (media.type == MediaType.video)
                const Center(
                  child: Icon(Icons.play_circle_fill_rounded, size: 42, color: Color(0xFFF7FBF8)),
                ),
              Positioned(
                left: 12,
                right: 12,
                bottom: 12,
                child: Text(
                  media.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Color(0xFFF7FBF8), fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
