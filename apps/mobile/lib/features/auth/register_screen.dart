import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/widgets/rhino_brand.dart';
import '../../core/widgets/rhino_surface.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _name = TextEditingController(text: 'Arjun Thapa');
  final _email = TextEditingController(text: 'arjun@example.com');
  final _password = TextEditingController(text: 'StrongPass123!');
  final _country = TextEditingController(text: 'Nepal');
  bool _showPassword = false;
  bool _submitting = false;

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
    final bottom = MediaQuery.paddingOf(context).bottom;

    return Scaffold(
      appBar: AppBar(
        leading: Padding(
          padding: const EdgeInsets.only(left: 12),
          child: IconButton.outlined(
            tooltip: 'Back',
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.arrow_back_rounded),
          ),
        ),
      ),
      body: SafeArea(
        top: false,
        child: ListView(
          padding: EdgeInsets.fromLTRB(22, 8, 22, 24 + bottom),
          children: [
            const RhinoBrandMark(size: 62, borderRadius: BorderRadius.all(Radius.circular(22))),
            const SizedBox(height: 22),
            Text('Create your account', style: Theme.of(context).textTheme.displaySmall),
            const SizedBox(height: 8),
            Text('Start booking verified services with real galleries, clear deposits, and trip tracking.', style: Theme.of(context).textTheme.bodyLarge),
            const SizedBox(height: 24),
            RhinoSurface(
              borderRadius: 32,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextField(
                    controller: _name,
                    textInputAction: TextInputAction.next,
                    autofillHints: const [AutofillHints.name],
                    decoration: const InputDecoration(labelText: 'Full name', prefixIcon: Icon(Icons.badge_outlined)),
                  ),
                  const SizedBox(height: 12),
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
                    textInputAction: TextInputAction.next,
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
                  const SizedBox(height: 12),
                  TextField(
                    controller: _country,
                    textInputAction: TextInputAction.done,
                    decoration: const InputDecoration(labelText: 'Country', prefixIcon: Icon(Icons.public_rounded)),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _submitting ? null : _submit,
                    child: Text(_submitting ? 'Creating account...' : 'Create account'),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'By continuing, you agree to secure booking requests and provider confirmation before payment.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Already have an account?', style: Theme.of(context).textTheme.bodyMedium),
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const LoginScreen()));
                  },
                  child: const Text('Login'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    final state = AppStateScope.of(context);
    setState(() => _submitting = true);
    try {
      await state.register(
        name: _name.text.trim(),
        email: _email.text.trim(),
        password: _password.text,
        country: _country.text.trim(),
      );
      if (!mounted) return;
      Navigator.of(context).popUntil((route) => route.isFirst);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.lastError ?? error.toString())));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }
}
