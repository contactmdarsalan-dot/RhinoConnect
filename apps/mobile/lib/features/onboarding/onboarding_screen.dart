import 'package:flutter/material.dart';

import '../../app/app_theme.dart';
import '../../core/widgets/rhino_brand.dart';
import '../../core/widgets/remote_image.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({required this.onComplete, super.key});

  final VoidCallback onComplete;

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _index = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final page = _pages[_index];

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 18, 24, 8),
              child: Row(
                children: [
                  const RhinoWordmark(markSize: 34, fontSize: 23),
                  const Spacer(),
                  TextButton(
                    onPressed: widget.onComplete,
                    child: const Text('Skip'),
                  ),
                ],
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _pages.length,
                onPageChanged: (value) => setState(() => _index = value),
                itemBuilder: (context, index) => _OnboardingPage(data: _pages[index]),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      _pages.length,
                      (index) => AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        width: index == _index ? 28 : 8,
                        height: 8,
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        decoration: BoxDecoration(
                          color: index == _index ? RhinoColors.pine : RhinoColors.mist,
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  ElevatedButton(
                    onPressed: () {
                      if (_index == _pages.length - 1) {
                        widget.onComplete();
                        return;
                      }
                      _controller.nextPage(duration: const Duration(milliseconds: 240), curve: Curves.easeOutCubic);
                    },
                    child: Text(_index == _pages.length - 1 ? 'Start booking' : page.buttonLabel),
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

class _OnboardingPage extends StatelessWidget {
  const _OnboardingPage({required this.data});

  final _OnboardingData data;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 0),
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(34),
          child: AspectRatio(
            aspectRatio: .88,
            child: Stack(
              fit: StackFit.expand,
              children: [
                RemoteImage(url: data.imageUrl),
                const DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0x00071811), Color(0xAA071811)],
                    ),
                  ),
                ),
                Positioned(
                  left: 20,
                  right: 20,
                  bottom: 20,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: RhinoColors.lime,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(data.badge, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        data.title,
                        style: Theme.of(context).textTheme.displaySmall?.copyWith(color: RhinoColors.brandCloud),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 22),
        Text(data.subtitle, style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: RhinoColors.slate)),
        const SizedBox(height: 18),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: data.chips.map((chip) => Chip(label: Text(chip))).toList(),
        ),
      ],
    );
  }
}

class _OnboardingData {
  const _OnboardingData({
    required this.badge,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    required this.chips,
    required this.buttonLabel,
  });

  final String badge;
  final String title;
  final String subtitle;
  final String imageUrl;
  final List<String> chips;
  final String buttonLabel;
}

final _pages = [
  const _OnboardingData(
    badge: 'Verified Nepal providers',
    title: 'Find trusted stays, treks, and retreats.',
    subtitle: 'Explore services with real media, ratings, deposits, and host confirmation before you commit.',
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1400&q=80',
    chips: ['Hotels', 'Trekking', 'Wellness'],
    buttonLabel: 'Next',
  ),
  const _OnboardingData(
    badge: 'Media before booking',
    title: 'Preview every service with images and video.',
    subtitle: 'Open full-screen galleries, check walkthroughs, and understand the experience before sending a request.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    chips: ['Photos', 'Video', 'Provider profile'],
    buttonLabel: 'Next',
  ),
  const _OnboardingData(
    badge: 'Simple request flow',
    title: 'Book calmly and track every trip.',
    subtitle: 'Your request stays pending until the operator confirms availability, then deposits and updates stay in one place.',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80',
    chips: ['Request', 'Confirm', 'Pay deposit'],
    buttonLabel: 'Start booking',
  ),
];
