import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../app/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/widgets/rhino_brand.dart';
import '../../core/widgets/remote_image.dart';
import '../../core/widgets/rhino_surface.dart';
import '../../core/widgets/service_card.dart';
import '../service_detail/service_detail_screen.dart';

class DiscoveryScreen extends StatelessWidget {
  const DiscoveryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppStateScope.of(context);
    final services = state.visibleServices;
    final featured = services.isNotEmpty ? services.first : state.services.first;
    final name = state.currentUser?.name.split(' ').first ?? 'Traveler';

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: CustomScrollView(
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              sliver: SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const RhinoWordmark(markSize: 34, fontSize: 22),
                        const Spacer(),
                        IconButton.filled(
                          tooltip: 'Notifications',
                          onPressed: () {},
                          style: IconButton.styleFrom(backgroundColor: RhinoColors.card, foregroundColor: RhinoColors.ink),
                          icon: const Icon(Icons.notifications_none_rounded),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Text('Hey $name', style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 4),
                    Text('Find your next Nepal experience', style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(height: 18),
                    _SearchBar(onChanged: state.setSearchQuery),
                    const SizedBox(height: 18),
                    _FeaturedCard(
                      service: featured,
                      onTap: () => _openService(context, featured),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 46,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: state.categories.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final category = state.categories[index];
                          return ChoiceChip(
                            label: Text(category),
                            selected: state.category == category,
                            onSelected: (_) => state.setCategory(category),
                            avatar: Icon(_categoryIcon(category), size: 18),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 22),
                    const SectionHeader(title: 'Top picks this season'),
                  ],
                ),
              ),
            ),
            if (services.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: _EmptySearch(onClear: () => state.setSearchQuery('')),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 122),
                sliver: SliverList.separated(
                  itemCount: services.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (context, index) {
                    final service = services[index];
                    return ServiceCard(service: service, onTap: () => _openService(context, service));
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _openService(BuildContext context, ServiceListing service) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => ServiceDetailScreen(service: service)));
  }
}

class _SearchBar extends StatelessWidget {
  const _SearchBar({required this.onChanged});

  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return TextField(
      onChanged: onChanged,
      textInputAction: TextInputAction.search,
      decoration: InputDecoration(
        hintText: 'Search destinations or activities',
        prefixIcon: const Icon(Icons.search_rounded),
        suffixIcon: Padding(
          padding: const EdgeInsets.only(right: 8),
          child: FilledButton(
            onPressed: () {},
            style: FilledButton.styleFrom(
              backgroundColor: RhinoColors.lime,
              foregroundColor: RhinoColors.pine,
              minimumSize: const Size(86, 42),
              padding: EdgeInsets.zero,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
            ),
            child: const Text('Nearby', style: TextStyle(fontWeight: FontWeight.w900)),
          ),
        ),
      ),
    );
  }
}

class _FeaturedCard extends StatelessWidget {
  const _FeaturedCard({required this.service, required this.onTap});

  final ServiceListing service;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final image = service.cover?.thumbnailUrl ?? service.cover?.url;

    return Semantics(
      button: true,
      label: 'Open ${service.title}',
      child: InkWell(
        borderRadius: BorderRadius.circular(30),
        onTap: onTap,
        child: Ink(
          height: 246,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(30),
            color: RhinoColors.mist,
          ),
          child: Stack(
            children: [
              if (image != null)
                Positioned.fill(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(30),
                    child: RemoteImage(url: image),
                  ),
                ),
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(30),
                    gradient: const LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0x05071811), Color(0xD1071811)],
                    ),
                  ),
                ),
              ),
              Positioned(
                left: 18,
                top: 18,
                child: _CountryPill(label: service.provider.country),
              ),
              Positioned(
                left: 20,
                right: 20,
                bottom: 18,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Moments that stay with you',
                            style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: RhinoColors.brandCloud),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '${service.title} in ${service.provider.city}',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFFDDE6EA)),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        border: Border.all(color: RhinoColors.brandCloud),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Text(
                        'Explore',
                        style: TextStyle(color: RhinoColors.brandCloud, fontWeight: FontWeight.w900),
                      ),
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

class _CountryPill extends StatelessWidget {
  const _CountryPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: RhinoColors.brandCloud.withValues(alpha: .9),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.place_rounded, size: 16, color: RhinoColors.coral),
          const SizedBox(width: 4),
          Text(label.toUpperCase(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 1)),
        ],
      ),
    );
  }
}

class _EmptySearch extends StatelessWidget {
  const _EmptySearch({required this.onClear});

  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.travel_explore_rounded, size: 54, color: RhinoColors.pine),
          const SizedBox(height: 14),
          Text('No matching services', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text('Try another destination, service, or category.', style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
          const SizedBox(height: 18),
          OutlinedButton(onPressed: onClear, child: const Text('Clear search')),
        ],
      ),
    );
  }
}

IconData _categoryIcon(String category) {
  return switch (category) {
    'Hotels' => Icons.hotel_rounded,
    'Trekking' => Icons.landscape_rounded,
    'Wellness' => Icons.spa_rounded,
    _ => Icons.grid_view_rounded,
  };
}
