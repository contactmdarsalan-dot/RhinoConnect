import 'package:flutter/material.dart';

import '../../app/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/widgets/remote_image.dart';
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
            expandedHeight: 390,
            pinned: true,
            stretch: true,
            backgroundColor: RhinoColors.pine,
            foregroundColor: RhinoColors.brandCloud,
            leading: Padding(
              padding: const EdgeInsets.only(left: 12),
              child: IconButton.filled(
                tooltip: 'Back',
                onPressed: () => Navigator.of(context).pop(),
                style: IconButton.styleFrom(backgroundColor: RhinoColors.brandCloud, foregroundColor: RhinoColors.ink),
                icon: const Icon(Icons.arrow_back_rounded),
              ),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if (cover == null)
                    Container(color: RhinoColors.mist)
                  else
                    RemoteImage(url: cover.thumbnailUrl ?? cover.url),
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Color(0x22071811), Color(0xC5071811)],
                      ),
                    ),
                  ),
                  Positioned(
                    left: 20,
                    right: 20,
                    bottom: 28,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(color: RhinoColors.lime, borderRadius: BorderRadius.circular(999)),
                          child: Text(
                            '${service.serviceType} in ${service.provider.city}',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: RhinoColors.pine),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          service.title,
                          style: Theme.of(context).textTheme.displaySmall?.copyWith(color: RhinoColors.brandCloud),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.star_rounded, color: RhinoColors.lime, size: 20),
                            const SizedBox(width: 4),
                            Text(
                              '${service.provider.rating} (${service.provider.reviewCount} reviews)',
                              style: const TextStyle(color: RhinoColors.brandCloud, fontWeight: FontWeight.w800),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 22, 20, 116),
            sliver: SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Descriptions', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 8),
                  Text(service.description, style: Theme.of(context).textTheme.bodyLarge),
                  const SizedBox(height: 24),
                  Text('About the experience', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 12),
                  GridView.count(
                    padding: EdgeInsets.zero,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    childAspectRatio: 1.45,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    children: [
                      _InfoTile(icon: Icons.schedule_rounded, label: 'Duration', value: service.durationLabel),
                      _InfoTile(icon: Icons.groups_rounded, label: 'Group size', value: 'Max ${service.capacity}'),
                      _InfoTile(icon: Icons.payments_outlined, label: 'Deposit', value: '${service.depositPercent}%'),
                      _InfoTile(icon: Icons.verified_rounded, label: 'Provider', value: service.provider.verified ? 'Verified' : 'Reviewing'),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text('Gallery', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 138,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: service.media.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 12),
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
                  Text('Includes', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 12),
                  RhinoSurface(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    borderRadius: 28,
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
                  Text('Hosted by', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 12),
                  RhinoSurface(
                    borderRadius: 28,
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 28,
                          backgroundColor: RhinoColors.lime,
                          child: Text(service.provider.name.substring(0, 1), style: const TextStyle(fontWeight: FontWeight.w900, color: RhinoColors.pine)),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(service.provider.name, style: Theme.of(context).textTheme.titleMedium),
                              const SizedBox(height: 4),
                              Text(service.locationLabel, style: Theme.of(context).textTheme.bodyMedium),
                            ],
                          ),
                        ),
                        const Icon(Icons.verified_rounded, color: RhinoColors.pine),
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
        child: Container(
          margin: const EdgeInsets.fromLTRB(20, 8, 20, 16),
          padding: const EdgeInsets.fromLTRB(16, 12, 12, 12),
          decoration: BoxDecoration(
            color: RhinoColors.card,
            borderRadius: BorderRadius.circular(30),
            boxShadow: const [BoxShadow(color: Color(0x22062B22), blurRadius: 24, offset: Offset(0, 12))],
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('From', style: Theme.of(context).textTheme.bodyMedium),
                    Text(service.priceLabel, style: Theme.of(context).textTheme.titleLarge),
                  ],
                ),
              ),
              FilledButton(
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => BookingScreen(service: service)),
                ),
                style: FilledButton.styleFrom(
                  backgroundColor: RhinoColors.pine,
                  foregroundColor: RhinoColors.brandCloud,
                  minimumSize: const Size(170, 58),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                ),
                child: const Text('Check availability', style: TextStyle(fontWeight: FontWeight.w900)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return RhinoSurface(
      borderRadius: 24,
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Text(label, style: Theme.of(context).textTheme.bodyMedium),
              const Spacer(),
              Icon(icon, color: RhinoColors.pine, size: 20),
            ],
          ),
          const SizedBox(height: 10),
          Text(value, style: Theme.of(context).textTheme.titleMedium),
        ],
      ),
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
        borderRadius: BorderRadius.circular(26),
        onTap: onTap,
        child: Ink(
          width: 178,
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(26)),
          child: Stack(
            children: [
              Positioned.fill(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(26),
                  child: RemoteImage(url: preview),
                ),
              ),
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(26),
                    gradient: const LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0x00071811), Color(0xAA071811)],
                    ),
                  ),
                ),
              ),
              if (media.type == MediaType.video)
                const Center(
                  child: CircleAvatar(
                    radius: 28,
                    backgroundColor: RhinoColors.brandCloud,
                    child: Icon(Icons.play_arrow_rounded, size: 38, color: RhinoColors.pine),
                  ),
                ),
              Positioned(
                left: 14,
                right: 14,
                bottom: 14,
                child: Text(
                  media.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: RhinoColors.brandCloud, fontWeight: FontWeight.w900, fontSize: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
