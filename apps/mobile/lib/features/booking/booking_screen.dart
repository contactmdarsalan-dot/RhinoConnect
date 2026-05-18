import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../app/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/widgets/remote_image.dart';
import '../../core/widgets/rhino_surface.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({required this.service, super.key});

  final ServiceListing service;

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  late DateTime _startDate = DateTime.now().add(const Duration(days: 7));
  late DateTime _endDate = _startDate.add(const Duration(days: 2));
  final _country = TextEditingController(text: 'Nepal');
  final _notes = TextEditingController();
  int _guests = 1;

  @override
  void dispose() {
    _country.dispose();
    _notes.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final service = widget.service;
    final deposit = service.basePrice * service.depositPercent / 100;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Booking request'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 124),
        children: [
          RhinoSurface(
            borderRadius: 30,
            padding: const EdgeInsets.all(14),
            color: RhinoColors.pine,
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(22),
                  child: SizedBox(
                    width: 86,
                    height: 86,
                    child: RemoteImage(url: service.cover?.thumbnailUrl ?? service.cover!.url),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(service.title, style: Theme.of(context).textTheme.titleMedium?.copyWith(color: RhinoColors.brandCloud)),
                      const SizedBox(height: 6),
                      Text(service.locationLabel, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFFDDE6EA))),
                      const SizedBox(height: 10),
                      Text(service.priceLabel, style: const TextStyle(color: RhinoColors.lime, fontWeight: FontWeight.w900, fontSize: 18)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),
          Text('Trip details', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _DateButton(
                  label: 'Start',
                  value: _dateLabel(_startDate),
                  onTap: () => _pickDate(isStart: true),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _DateButton(
                  label: 'End',
                  value: _dateLabel(_endDate),
                  onTap: () => _pickDate(isStart: false),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          RhinoSurface(
            borderRadius: 28,
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Guests', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 4),
                      Text('Capacity ${service.capacity}', style: Theme.of(context).textTheme.bodyMedium),
                    ],
                  ),
                ),
                IconButton.outlined(
                  tooltip: 'Decrease guests',
                  onPressed: _guests == 1 ? null : () => setState(() => _guests -= 1),
                  icon: const Icon(Icons.remove_rounded),
                ),
                SizedBox(
                  width: 46,
                  child: Text('$_guests', textAlign: TextAlign.center, style: Theme.of(context).textTheme.titleLarge),
                ),
                IconButton.filled(
                  tooltip: 'Increase guests',
                  onPressed: _guests == service.capacity ? null : () => setState(() => _guests += 1),
                  icon: const Icon(Icons.add_rounded),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          Text('Contact details', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          TextField(
            controller: _country,
            decoration: const InputDecoration(labelText: 'Country', prefixIcon: Icon(Icons.public_rounded)),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _notes,
            minLines: 4,
            maxLines: 6,
            decoration: const InputDecoration(
              labelText: 'Special requests',
              alignLabelWithHint: true,
              prefixIcon: Icon(Icons.edit_note_rounded),
            ),
          ),
          const SizedBox(height: 18),
          RhinoSurface(
            borderRadius: 26,
            color: RhinoColors.muted,
            child: Row(
              children: [
                Expanded(child: _Metric(label: 'Estimated total', value: service.priceLabel)),
                const SizedBox(width: 10),
                Expanded(child: _Metric(label: 'Deposit due', value: money(deposit, currency: service.currency))),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
          child: ElevatedButton.icon(
            onPressed: _submit,
            icon: const Icon(Icons.send_rounded),
            label: const Text('Send booking request'),
          ),
        ),
      ),
    );
  }

  Future<void> _pickDate({required bool isStart}) async {
    final initialDate = isStart ? _startDate : _endDate;
    final picked = await showDatePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 730)),
      initialDate: initialDate,
    );
    if (picked == null) return;
    setState(() {
      if (isStart) {
        _startDate = picked;
        if (!_endDate.isAfter(_startDate)) {
          _endDate = _startDate.add(const Duration(days: 1));
        }
      } else {
        _endDate = picked.isAfter(_startDate) ? picked : _startDate.add(const Duration(days: 1));
      }
    });
  }

  void _submit() {
    final state = AppStateScope.of(context);
    state.createBooking(
      BookingDraft(
        service: widget.service,
        startDate: _startDate,
        endDate: _endDate,
        guests: _guests,
        country: _country.text.trim(),
        notes: _notes.text.trim(),
      ),
    );
    Navigator.of(context).popUntil((route) => route.isFirst);
  }
}

class _DateButton extends StatelessWidget {
  const _DateButton({required this.label, required this.value, required this.onTap});

  final String label;
  final String value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: onTap,
      style: OutlinedButton.styleFrom(
        alignment: Alignment.centerLeft,
        backgroundColor: RhinoColors.card,
        padding: const EdgeInsets.all(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(label, style: Theme.of(context).textTheme.bodyMedium),
              const Spacer(),
              const Icon(Icons.calendar_today_rounded, size: 16),
            ],
          ),
          const SizedBox(height: 8),
          Text(value, style: Theme.of(context).textTheme.titleMedium),
        ],
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: Theme.of(context).textTheme.bodyMedium),
        const SizedBox(height: 6),
        Text(value, style: Theme.of(context).textTheme.titleMedium),
      ],
    );
  }
}

String _dateLabel(DateTime date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return '${months[date.month - 1]} ${date.day}, ${date.year}';
}
