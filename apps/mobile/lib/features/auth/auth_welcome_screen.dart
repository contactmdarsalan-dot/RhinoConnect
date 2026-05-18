import 'package:flutter/material.dart';

import '../../app/app_theme.dart';
import '../../core/data/demo_data.dart';
import '../../core/widgets/remote_image.dart';
import '../../core/widgets/rhino_brand.dart';
import '../../core/widgets/rhino_surface.dart';
import 'login_screen.dart';
import 'register_screen.dart';

class AuthWelcomeScreen extends StatelessWidget {
  const AuthWelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.paddingOf(context).bottom;
    final hero = DemoData.services[1];

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: EdgeInsets.fromLTRB(22, 18, 22, 24 + bottom),
          children: [
            const RhinoWordmark(markSize: 38, fontSize: 25),
            const SizedBox(height: 22),
            ClipRRect(
              borderRadius: BorderRadius.circular(36),
              child: AspectRatio(
                aspectRatio: .82,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    RemoteImage(url: hero.cover!.url),
                    const DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [Color(0x08071811), Color(0xD9071811)],
                        ),
                      ),
                    ),
                    const Positioned(
                      left: 18,
                      right: 18,
                      top: 18,
                      child: Row(
                        children: [
                          _TrustPill(icon: Icons.verified_rounded, label: 'Verified providers'),
                          Spacer(),
                          _TrustPill(icon: Icons.star_rounded, label: '4.8 avg'),
                        ],
                      ),
                    ),
                    Positioned(
                      left: 22,
                      right: 22,
                      bottom: 24,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Book premium local services anywhere.',
                            style: Theme.of(context).textTheme.displaySmall?.copyWith(color: RhinoColors.brandCloud),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'RhinoConnect brings trusted stays, treks, wellness, events, and service providers into one smooth booking app.',
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: const Color(0xFFE4EFEC)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 18),
            RhinoSurface(
              borderRadius: 32,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Row(
                    children: [
                      Expanded(child: _ValueTile(icon: Icons.lock_rounded, title: 'Safe deposits')),
                      SizedBox(width: 10),
                      Expanded(child: _ValueTile(icon: Icons.photo_library_rounded, title: 'Real media')),
                    ],
                  ),
                  const SizedBox(height: 14),
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen())),
                    child: const Text('Login'),
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton(
                    onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RegisterScreen())),
                    child: const Text('Create account'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TrustPill extends StatelessWidget {
  const _TrustPill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 8),
      decoration: BoxDecoration(
        color: RhinoColors.brandCloud.withValues(alpha: .92),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: RhinoColors.pine, size: 16),
          const SizedBox(width: 5),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: RhinoColors.pine)),
        ],
      ),
    );
  }
}

class _ValueTile extends StatelessWidget {
  const _ValueTile({required this.icon, required this.title});

  final IconData icon;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: RhinoColors.muted,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          Icon(icon, color: RhinoColors.pine, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w900, color: RhinoColors.ink),
            ),
          ),
        ],
      ),
    );
  }
}
