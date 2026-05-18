import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../app/app_theme.dart';
import '../../core/widgets/rhino_brand.dart';
import '../../core/widgets/rhino_surface.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppStateScope.of(context);
    final user = state.currentUser;

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 22, 20, 122),
          children: [
            Text('Profile', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 16),
            RhinoSurface(
              borderRadius: 32,
              color: RhinoColors.rhinoBlue,
              child: Row(
                children: [
                  const RhinoBrandMark(
                    size: 58,
                    backgroundColor: RhinoColors.brandCloud,
                    markColor: RhinoColors.rhinoBlue,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user?.name ?? 'Guest', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: RhinoColors.brandCloud)),
                        const SizedBox(height: 4),
                        Text(user?.email ?? 'guest@rhinoconnect.app', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFFDDE6EA))),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),
            const SectionHeader(title: 'Account'),
            const RhinoSurface(
              padding: EdgeInsets.all(6),
              borderRadius: 30,
              child: Column(
                children: [
                  _ProfileItem(icon: Icons.verified_user_outlined, title: 'Identity and trust', subtitle: 'Verified providers, safer bookings'),
                  _ProfileItem(icon: Icons.credit_card_rounded, title: 'Payment methods', subtitle: 'Deposits and full payments'),
                  _ProfileItem(icon: Icons.notifications_none_rounded, title: 'Notifications', subtitle: 'Booking, payment, and provider updates'),
                  _ProfileItem(icon: Icons.support_agent_rounded, title: 'Support', subtitle: 'Help with bookings and disputes'),
                ],
              ),
            ),
            const SizedBox(height: 18),
            OutlinedButton.icon(
              onPressed: state.signOut,
              icon: const Icon(Icons.logout_rounded),
              label: const Text('Sign out'),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileItem extends StatelessWidget {
  const _ProfileItem({required this.icon, required this.title, required this.subtitle});

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      minVerticalPadding: 14,
      leading: Container(
        width: 46,
        height: 46,
        decoration: BoxDecoration(
          color: RhinoColors.muted,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Icon(icon, color: RhinoColors.pine),
      ),
      title: Text(title, style: Theme.of(context).textTheme.titleMedium),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right_rounded),
    );
  }
}
