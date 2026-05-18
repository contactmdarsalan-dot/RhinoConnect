import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../app/app_theme.dart';
import '../../core/widgets/rhino_surface.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _name = TextEditingController(text: 'Arjun Thapa');
  final _email = TextEditingController(text: 'arjun@example.com');
  final _password = TextEditingController(text: 'StrongPass123!');
  final _country = TextEditingController(text: 'Nepal');
  bool _registerMode = false;
  bool _showPassword = false;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _country.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = AppStateScope.of(context);
    final bottom = MediaQuery.paddingOf(context).bottom;

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: EdgeInsets.fromLTRB(20, 28, 20, 24 + bottom),
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: RhinoColors.pine,
                borderRadius: BorderRadius.circular(18),
              ),
              child: const Icon(Icons.terrain_rounded, color: Color(0xFFF7FBF8), size: 30),
            ),
            const SizedBox(height: 28),
            Text('RhinoConnect', style: Theme.of(context).textTheme.displaySmall),
            const SizedBox(height: 10),
            Text(
              'Book trusted stays, treks, wellness retreats, and local services with verified providers.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: RhinoColors.slate),
            ),
            const SizedBox(height: 28),
            RhinoSurface(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  SegmentedButton<bool>(
                    segments: const [
                      ButtonSegment(value: false, label: Text('Login'), icon: Icon(Icons.login_rounded)),
                      ButtonSegment(value: true, label: Text('Register'), icon: Icon(Icons.person_add_alt_rounded)),
                    ],
                    selected: {_registerMode},
                    onSelectionChanged: (value) => setState(() => _registerMode = value.first),
                  ),
                  const SizedBox(height: 18),
                  if (_registerMode) ...[
                    TextField(
                      controller: _name,
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(labelText: 'Full name', prefixIcon: Icon(Icons.badge_outlined)),
                    ),
                    const SizedBox(height: 12),
                  ],
                  TextField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    autofillHints: const [AutofillHints.email],
                    decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.mail_outline_rounded)),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _password,
                    obscureText: !_showPassword,
                    autofillHints: const [AutofillHints.password],
                    decoration: InputDecoration(
                      labelText: 'Password',
                      prefixIcon: const Icon(Icons.lock_outline_rounded),
                      suffixIcon: IconButton(
                        tooltip: _showPassword ? 'Hide password' : 'Show password',
                        onPressed: () => setState(() => _showPassword = !_showPassword),
                        icon: Icon(_showPassword ? Icons.visibility_off_rounded : Icons.visibility_rounded),
                      ),
                    ),
                  ),
                  if (_registerMode) ...[
                    const SizedBox(height: 12),
                    TextField(
                      controller: _country,
                      textInputAction: TextInputAction.done,
                      decoration: const InputDecoration(labelText: 'Country', prefixIcon: Icon(Icons.public_rounded)),
                    ),
                  ],
                  const SizedBox(height: 18),
                  ElevatedButton(
                    onPressed: () {
                      if (_registerMode) {
                        state.register(name: _name.text.trim(), email: _email.text.trim(), country: _country.text.trim());
                      } else {
                        state.signIn(email: _email.text.trim(), password: _password.text);
                      }
                    },
                    child: Text(_registerMode ? 'Create account' : 'Continue'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            Text(
              'Secure booking requests, provider confirmation, deposit tracking, and trip history are built into the mobile flow.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
