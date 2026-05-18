import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../app/app_theme.dart';
import '../../core/widgets/rhino_surface.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppStateScope.of(context);
    final user = state.currentUser;

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 104),
        children: [
          RhinoSurface(
            child: Row(
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: RhinoColors.sky,
                  child: Text(
                    user?.name.substring(0, 1).toUpperCase() ?? 'R',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: RhinoColors.ink),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user?.name ?? 'Guest', style: Theme.of(context).textTheme.titleLarge),
                      const SizedBox(height: 4),
                      Text(user?.email ?? 'guest@rhinoconnect.app', style: Theme.of(context).textTheme.bodyMedium),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          const SectionHeader(title: 'Account'),
          RhinoSurface(
            padding: const EdgeInsets.all(6),
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
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: const Color(0xFFEFF3F0),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Icon(icon, color: RhinoColors.pine),
      ),
      title: Text(title, style: Theme.of(context).textTheme.titleMedium),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right_rounded),
    );
  }
}
