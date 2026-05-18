import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../app/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/widgets/rhino_surface.dart';

class TripsScreen extends StatelessWidget {
  const TripsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppStateScope.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Trips')),
      body: state.bookings.isEmpty
          ? _EmptyTrips(onExplore: () => state.setTab(0))
          : ListView.separated(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 104),
              itemCount: state.bookings.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (context, index) => _BookingCard(booking: state.bookings[index]),
            ),
    );
  }
}

class _EmptyTrips extends StatelessWidget {
  const _EmptyTrips({required this.onExplore});

  final VoidCallback onExplore;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 76,
              height: 76,
              decoration: BoxDecoration(
                color: RhinoColors.sky,
                borderRadius: BorderRadius.circular(26),
              ),
              child: const Icon(Icons.travel_explore_rounded, color: RhinoColors.pine, size: 38),
            ),
            const SizedBox(height: 20),
            Text('No bookings yet', style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(
              'Choose a service, send a request, and track the provider response here.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: RhinoColors.slate),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton(onPressed: onExplore, child: const Text('Explore services')),
          ],
        ),
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

    return RhinoSurface(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(booking.service.title, style: Theme.of(context).textTheme.titleLarge)),
              _StatusPill(label: booking.status),
            ],
          ),
          const SizedBox(height: 8),
          Text('${_dateLabel(booking.startDate)} to ${_dateLabel(booking.endDate)}', style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _MiniMetric(label: 'Reference', value: booking.reference)),
              const SizedBox(width: 10),
              Expanded(child: _MiniMetric(label: 'Payment', value: booking.paymentStatus)),
            ],
          ),
          if (booking.paymentStatus == 'Unpaid') ...[
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () => state.markDepositPaid(booking.reference),
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
  const _StatusPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: RhinoColors.sky,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: RhinoColors.ink)),
    );
  }
}

class _MiniMetric extends StatelessWidget {
  const _MiniMetric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: Theme.of(context).textTheme.bodyMedium),
        const SizedBox(height: 4),
        Text(value, style: Theme.of(context).textTheme.titleMedium),
      ],
    );
  }
}

String _dateLabel(DateTime date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return '${months[date.month - 1]} ${date.day}';
}
