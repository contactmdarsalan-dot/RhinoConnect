import 'package:flutter/material.dart';

import '../features/auth/auth_welcome_screen.dart';
import '../features/booking_hub/booking_hub_screen.dart';
import '../features/discovery/discovery_screen.dart';
import '../features/onboarding/onboarding_screen.dart';
import '../features/onboarding/splash_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/search/search_screen.dart';
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
            if (!_state.splashComplete) {
              return SplashScreen(onComplete: _state.completeSplash);
            }
            if (!_state.onboardingComplete) {
              return OnboardingScreen(onComplete: _state.completeOnboarding);
            }
            if (!_state.isAuthenticated) {
              return const AuthWelcomeScreen();
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
          SearchScreen(),
          BookingHubScreen(),
          TripsScreen(),
          ProfileScreen(),
        ],
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 12),
          child: _RhinoBottomNav(
            index: state.tabIndex,
            onSelected: state.setTab,
          ),
        ),
      ),
    );
  }
}

class _RhinoBottomNav extends StatelessWidget {
  const _RhinoBottomNav({required this.index, required this.onSelected});

  final int index;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 82,
      decoration: BoxDecoration(
        color: RhinoColors.pine,
        borderRadius: BorderRadius.circular(30),
        boxShadow: const [BoxShadow(color: Color(0x24062B22), blurRadius: 22, offset: Offset(0, 12))],
      ),
      child: Row(
        children: [
          _NavItem(icon: Icons.home_rounded, label: 'Home', selected: index == 0, onTap: () => onSelected(0)),
          _NavItem(icon: Icons.search_rounded, label: 'Search', selected: index == 1, onTap: () => onSelected(1)),
          _CenterNavItem(selected: index == 2, onTap: () => onSelected(2)),
          _NavItem(icon: Icons.card_travel_rounded, label: 'Trips', selected: index == 3, onTap: () => onSelected(3)),
          _NavItem(icon: Icons.person_rounded, label: 'Profile', selected: index == 4, onTap: () => onSelected(4)),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({required this.icon, required this.label, required this.selected, required this.onTap});

  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Semantics(
        selected: selected,
        button: true,
        label: label,
        child: InkWell(
          borderRadius: BorderRadius.circular(22),
          onTap: onTap,
          child: Center(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: selected ? RhinoColors.brandCloud.withValues(alpha: .12) : Colors.transparent,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(icon, color: selected ? RhinoColors.lime : RhinoColors.brandCloud, size: 23),
                  const SizedBox(height: 4),
                  Text(
                    label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: selected ? RhinoColors.lime : RhinoColors.brandCloud.withValues(alpha: .78),
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _CenterNavItem extends StatelessWidget {
  const _CenterNavItem({required this.selected, required this.onTap});

  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Semantics(
        selected: selected,
        button: true,
        label: 'Book',
        child: InkWell(
          borderRadius: BorderRadius.circular(999),
          onTap: onTap,
          child: Center(
            child: Transform.translate(
              offset: const Offset(0, -18),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    width: selected ? 68 : 64,
                    height: selected ? 68 : 64,
                    decoration: BoxDecoration(
                      color: RhinoColors.lime,
                      shape: BoxShape.circle,
                      border: Border.all(color: RhinoColors.cloud, width: 5),
                      boxShadow: const [BoxShadow(color: Color(0x33062B22), blurRadius: 20, offset: Offset(0, 10))],
                    ),
                    child: const Icon(Icons.calendar_month_rounded, color: RhinoColors.pine, size: 31),
                  ),
                  const SizedBox(height: 3),
                  const Text(
                    'Book',
                    style: TextStyle(color: RhinoColors.brandCloud, fontSize: 11, fontWeight: FontWeight.w900),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
