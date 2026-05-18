import 'package:flutter/material.dart';

import '../features/auth/auth_screen.dart';
import '../features/discovery/discovery_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/trips/trips_screen.dart';
import 'app_state.dart';
import 'app_theme.dart';

class RhinoConnectApp extends StatefulWidget {
  const RhinoConnectApp({super.key});

  @override
  State<RhinoConnectApp> createState() => _RhinoConnectAppState();
}

class _RhinoConnectAppState extends State<RhinoConnectApp> {
  late final AppState _state = AppState();

  @override
  void dispose() {
    _state.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppStateScope(
      notifier: _state,
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'RhinoConnect',
        theme: AppTheme.light(),
        home: AnimatedBuilder(
          animation: _state,
          builder: (context, _) {
            if (!_state.isAuthenticated) {
              return const AuthScreen();
            }
            return const MainNavigation();
          },
        ),
      ),
    );
  }
}

class MainNavigation extends StatelessWidget {
  const MainNavigation({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppStateScope.of(context);

    return Scaffold(
      body: IndexedStack(
        index: state.tabIndex,
        children: const [
          DiscoveryScreen(),
          TripsScreen(),
          ProfileScreen(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: state.tabIndex,
        onDestinationSelected: state.setTab,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.search_rounded), selectedIcon: Icon(Icons.search_rounded), label: 'Explore'),
          NavigationDestination(icon: Icon(Icons.event_note_outlined), selectedIcon: Icon(Icons.event_note_rounded), label: 'Trips'),
          NavigationDestination(icon: Icon(Icons.person_outline_rounded), selectedIcon: Icon(Icons.person_rounded), label: 'Profile'),
        ],
      ),
    );
  }
}
