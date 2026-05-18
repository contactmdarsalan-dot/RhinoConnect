import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../app/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/widgets/remote_image.dart';
import '../../core/widgets/rhino_brand.dart';
import '../../core/widgets/rhino_surface.dart';
import '../booking/booking_screen.dart';
import '../service_detail/service_detail_screen.dart';

class BookingHubScreen extends StatelessWidget {
  const BookingHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppStateScope.of(context);
    final services = state.services;
    final featured = services.first;

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 22, 20, 122),
          children: [
            Row(
              children: [
                Text('Book', style: Theme.of(context).textTheme.headlineMedium),
                const Spacer(),
                const RhinoBrandMark(size: 42, borderRadius: BorderRadius.all(Radius.circular(16))),
              ],
            ),
            const SizedBox(height: 6),
            Text('Choose a verified service and send a booking request in minutes.', style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 18),
            _FeaturedBooking(
              service: featured,
              onDetails: () => _openService(context, featured),
              onBook: () => _openBooking(context, featured),
            ),
            const SizedBox(height: 20),
            Text('Fast actions', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _QuickAction(icon: Icons.hotel_rounded, title: 'Stay', onTap: () => _filterAndSearch(state, 'Hotels'))),
                const SizedBox(width: 10),
                Expanded(child: _QuickAction(icon: Icons.landscape_rounded, title: 'Trek', onTap: () => _filterAndSearch(state, 'Trekking'))),
                const SizedBox(width: 10),
                Expanded(child: _QuickAction(icon: Icons.spa_rounded, title: 'Retreat', onTap: () => _filterAndSearch(state, 'Wellness'))),
              ],
            ),
            const SizedBox(height: 22),
            Row(
              children: [
                Expanded(child: Text('Ready to request', style: Theme.of(context).textTheme.titleLarge)),
                TextButton(onPressed: () => state.setTab(1), child: const Text('Search all')),
              ],
            ),
            const SizedBox(height: 8),
            ...services.map(
              (service) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _BookableService(
                  service: service,
                  onView: () => _openService(context, service),
                  onBook: () => _openBooking(context, service),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _filterAndSearch(AppState state, String category) {
    state.setCategory(category);
    state.setTab(1);
  }

  void _openService(BuildContext context, ServiceListing service) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => ServiceDetailScreen(service: service)));
  }

  void _openBooking(BuildContext context, ServiceListing service) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => BookingScreen(service: service)));
  }
}

class _FeaturedBooking extends StatelessWidget {
  const _FeaturedBooking({
    required this.service,
    required this.onDetails,
    required this.onBook,
  });

  final ServiceListing service;
  final VoidCallback onDetails;
  final VoidCallback onBook;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: RhinoColors.rhinoBlue,
        borderRadius: BorderRadius.circular(36),
        boxShadow: const [BoxShadow(color: Color(0x22183F78), blurRadius: 28, offset: Offset(0, 16))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(36)),
            child: AspectRatio(
              aspectRatio: 1.28,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  RemoteImage(url: service.cover?.thumbnailUrl ?? service.cover!.url),
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Color(0x00183F78), Color(0xCC183F78)],
                      ),
                    ),
                  ),
                  Positioned(
                    left: 18,
                    top: 18,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(color: RhinoColors.lime, borderRadius: BorderRadius.circular(999)),
                      child: const Text('Recommended today', style: TextStyle(fontWeight: FontWeight.w900, color: RhinoColors.pine)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 16, 18, 18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(service.title, style: Theme.of(context).textTheme.titleLarge?.copyWith(color: RhinoColors.brandCloud)),
                const SizedBox(height: 6),
                Text(service.description, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFFDDE6EA))),
                const SizedBox(height: 14),
                Row(
                  children: [
                    _DarkMetric(label: 'From', value: service.priceLabel),
                    const SizedBox(width: 10),
                    _DarkMetric(label: 'Deposit', value: '${service.depositPercent}%'),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: onDetails,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: RhinoColors.brandCloud,
                          side: const BorderSide(color: Color(0x55F7FAF4)),
                        ),
                        child: const Text('Details'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: onBook,
                        style: ElevatedButton.styleFrom(backgroundColor: RhinoColors.lime, foregroundColor: RhinoColors.pine),
                        child: const Text('Request booking'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({required this.icon, required this.title, required this.onTap});

  final IconData icon;
  final String title;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(26),
      onTap: onTap,
      child: Ink(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 16),
        decoration: BoxDecoration(color: RhinoColors.card, borderRadius: BorderRadius.circular(26), border: Border.all(color: RhinoColors.mist)),
        child: Column(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(color: RhinoColors.muted, borderRadius: BorderRadius.circular(18)),
              child: Icon(icon, color: RhinoColors.pine),
            ),
            const SizedBox(height: 10),
            Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w900)),
          ],
        ),
      ),
    );
  }
}

class _BookableService extends StatelessWidget {
  const _BookableService({
    required this.service,
    required this.onView,
    required this.onBook,
  });

  final ServiceListing service;
  final VoidCallback onView;
  final VoidCallback onBook;

  @override
  Widget build(BuildContext context) {
    return RhinoSurface(
      borderRadius: 28,
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          GestureDetector(
            onTap: onView,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(22),
              child: SizedBox(
                width: 78,
                height: 78,
                child: RemoteImage(url: service.cover?.thumbnailUrl ?? service.cover!.url),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: onView,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(service.title, maxLines: 2, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 5),
                  Text('${service.durationLabel} - ${service.priceLabel}', style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.photo_library_outlined, color: RhinoColors.pine, size: 17),
                      const SizedBox(width: 4),
                      Text('${service.media.length} media', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: RhinoColors.pine)),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 10),
          IconButton.filled(
            tooltip: 'Book ${service.title}',
            onPressed: onBook,
            style: IconButton.styleFrom(backgroundColor: RhinoColors.lime, foregroundColor: RhinoColors.pine),
            icon: const Icon(Icons.arrow_forward_rounded),
          ),
        ],
      ),
    );
  }
}

class _DarkMetric extends StatelessWidget {
  const _DarkMetric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: RhinoColors.brandCloud.withValues(alpha: .1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: RhinoColors.brandCloud.withValues(alpha: .12)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFFC9D9D5))),
            const SizedBox(height: 4),
            Text(value, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: RhinoColors.brandCloud, fontWeight: FontWeight.w900)),
          ],
        ),
      ),
    );
  }
}
