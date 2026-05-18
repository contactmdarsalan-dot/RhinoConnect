import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../app/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/widgets/remote_image.dart';
import '../../core/widgets/rhino_surface.dart';

class TripsScreen extends StatelessWidget {
  const TripsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppStateScope.of(context);

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: CustomScrollView(
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 22, 20, 0),
              sliver: SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Your trips', style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 6),
                    Text('Track requests, deposits, and provider confirmations.', style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(height: 18),
                    if (state.bookings.isNotEmpty)
                      RhinoSurface(
                        borderRadius: 28,
                        color: RhinoColors.pine,
                        child: Row(
                          children: [
                            const Icon(Icons.verified_rounded, color: RhinoColors.lime),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'Requests stay pending until the provider confirms availability.',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFFDDE6EA)),
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),
            if (state.bookings.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: _EmptyTrips(onExplore: () => state.setTab(0)),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 122),
                sliver: SliverList.separated(
                  itemCount: state.bookings.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 14),
                  itemBuilder: (context, index) => _BookingCard(booking: state.bookings[index]),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _EmptyTrips extends StatelessWidget {
  const _EmptyTrips({required this.onExplore});

  final VoidCallback onExplore;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 86,
            height: 86,
            decoration: BoxDecoration(
              color: RhinoColors.lime,
              borderRadius: BorderRadius.circular(30),
            ),
            child: const Icon(Icons.card_travel_rounded, color: RhinoColors.pine, size: 42),
          ),
          const SizedBox(height: 22),
          Text('No bookings yet', style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
          const SizedBox(height: 8),
          Text(
            'Choose a service, send a request, and track the provider response here.',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: RhinoColors.slate),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 22),
          ElevatedButton(onPressed: onExplore, child: const Text('Explore services')),
        ],
      ),
    );
  }
}

class _BookingCard extends StatelessWidget {
  const _BookingCard({required this.booking});

  final CustomerBooking booking;

  @override
  Widget build(BuildContext context) {
    final state = AppStateScope.of(context);
    final preview = booking.service.cover?.thumbnailUrl ?? booking.service.cover?.url;

    return RhinoSurface(
      borderRadius: 30,
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(22),
                child: SizedBox(
                  width: 78,
                  height: 78,
                  child: preview == null ? Container(color: RhinoColors.mist) : RemoteImage(url: preview),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(booking.service.title, style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 6),
                    Text('${_dateLabel(booking.startDate)} to ${_dateLabel(booking.endDate)}', style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _StatusPill(label: booking.status),
                        _StatusPill(label: booking.paymentStatus, muted: booking.paymentStatus != 'Unpaid'),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _MiniMetric(label: 'Reference', value: booking.reference)),
              const SizedBox(width: 10),
              Expanded(child: _MiniMetric(label: 'Guests', value: '${booking.guests}')),
            ],
          ),
          if (booking.paymentStatus == 'Unpaid') ...[
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () async {
                try {
                  await state.markDepositPaid(booking.reference);
                } catch (error) {
                  if (!context.mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.lastError ?? error.toString())));
                }
              },
              icon: const Icon(Icons.payments_outlined),
              label: Text('Pay ${booking.service.depositPercent}% deposit'),
            ),
          ],
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.label, this.muted = false});

  final String label;
  final bool muted;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: muted ? RhinoColors.muted : RhinoColors.lime,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: RhinoColors.pine)),
    );
  }
}

class _MiniMetric extends StatelessWidget {
  const _MiniMetric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: RhinoColors.muted, borderRadius: BorderRadius.circular(20)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 4),
          Text(value, style: Theme.of(context).textTheme.titleMedium),
        ],
      ),
    );
  }
}

String _dateLabel(DateTime date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return '${months[date.month - 1]} ${date.day}';
}
