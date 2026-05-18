import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../app/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/widgets/rhino_surface.dart';
import '../../core/widgets/service_card.dart';
import '../service_detail/service_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  late final TextEditingController _query = TextEditingController();

  @override
  void dispose() {
    _query.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = AppStateScope.of(context);
    final services = state.visibleServices;

    if (_query.text != state.searchQuery) {
      _query.value = TextEditingValue(
        text: state.searchQuery,
        selection: TextSelection.collapsed(offset: state.searchQuery.length),
      );
    }

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
                    Text('Search services', style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 6),
                    Text('Find stays, treks, wellness, events, and providers with real media.', style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(height: 18),
                    TextField(
                      controller: _query,
                      autofocus: true,
                      onChanged: state.setSearchQuery,
                      textInputAction: TextInputAction.search,
                      decoration: InputDecoration(
                        hintText: 'Destination, service, provider...',
                        prefixIcon: const Icon(Icons.search_rounded),
                        suffixIcon: state.searchQuery.isEmpty
                            ? null
                            : IconButton(
                                tooltip: 'Clear search',
                                onPressed: () {
                                  _query.clear();
                                  state.setSearchQuery('');
                                },
                                icon: const Icon(Icons.close_rounded),
                              ),
                      ),
                    ),
                    const SizedBox(height: 16),
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
                      borderRadius: 28,
                      color: RhinoColors.rhinoBlue,
                      child: Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(color: RhinoColors.lime, borderRadius: BorderRadius.circular(18)),
                            child: const Icon(Icons.tune_rounded, color: RhinoColors.pine),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              '${services.length} premium services match your current filters.',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(color: RhinoColors.brandCloud),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 22),
                  ],
                ),
              ),
            ),
            if (services.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: _EmptyResults(onReset: () => _resetSearch(state)),
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

  void _resetSearch(AppState state) {
    _query.clear();
    state.setSearchQuery('');
    state.setCategory('All');
  }

  void _openService(BuildContext context, ServiceListing service) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => ServiceDetailScreen(service: service)));
  }
}

class _EmptyResults extends StatelessWidget {
  const _EmptyResults({required this.onReset});

  final VoidCallback onReset;

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
            decoration: BoxDecoration(color: RhinoColors.muted, borderRadius: BorderRadius.circular(30)),
            child: const Icon(Icons.search_off_rounded, color: RhinoColors.pine, size: 42),
          ),
          const SizedBox(height: 20),
          Text('No services found', style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
          const SizedBox(height: 8),
          Text('Try a different destination, activity, or category.', style: Theme.of(context).textTheme.bodyLarge, textAlign: TextAlign.center),
          const SizedBox(height: 20),
          ElevatedButton(onPressed: onReset, child: const Text('Reset filters')),
        ],
      ),
    );
  }
}
