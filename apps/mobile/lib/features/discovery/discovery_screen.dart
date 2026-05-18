import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../app/app_theme.dart';
import '../../core/widgets/rhino_surface.dart';
import '../../core/widgets/service_card.dart';
import '../service_detail/service_detail_screen.dart';

class DiscoveryScreen extends StatelessWidget {
  const DiscoveryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppStateScope.of(context);
    final services = state.visibleServices;

    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
              sliver: SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Find your next booking', style: Theme.of(context).textTheme.headlineMedium),
                              const SizedBox(height: 6),
                              Text('Verified providers across Nepal', style: Theme.of(context).textTheme.bodyMedium),
                            ],
                          ),
                        ),
                        IconButton.filledTonal(
                          tooltip: 'Notifications',
                          onPressed: () {},
                          icon: const Icon(Icons.notifications_none_rounded),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    TextField(
                      onChanged: state.setSearchQuery,
                      textInputAction: TextInputAction.search,
                      decoration: const InputDecoration(
                        labelText: 'Search services or places',
                        prefixIcon: Icon(Icons.search_rounded),
                      ),
                    ),
                    const SizedBox(height: 18),
                    SizedBox(
                      height: 44,
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
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 18),
                    RhinoSurface(
                      color: RhinoColors.alpine,
                      child: Row(
                        children: [
                          Container(
                            width: 46,
                            height: 46,
                            decoration: BoxDecoration(
                              color: RhinoColors.saffron,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Icon(Icons.verified_rounded, color: RhinoColors.alpine),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Provider verified before payment',
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(color: const Color(0xFFF7FBF8)),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Requests stay pending until the operator confirms availability.',
                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFFC9D9D5)),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 22),
                    const SectionHeader(title: 'Recommended'),
                  ],
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 104),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    if (index.isOdd) {
                      return const SizedBox(height: 14);
                    }
                    final service = services[index ~/ 2];
                    return ServiceCard(
                      service: service,
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => ServiceDetailScreen(service: service)),
                      ),
                    );
                  },
                  childCount: services.isEmpty ? 0 : services.length * 2 - 1,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
