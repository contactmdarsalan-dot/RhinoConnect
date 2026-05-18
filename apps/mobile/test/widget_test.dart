import 'package:flutter_test/flutter_test.dart';
import 'package:rhinoconnect_mobile/app/rhino_connect_app.dart';

void main() {
  testWidgets('moves from splash to onboarding', (tester) async {
    await tester.pumpWidget(const RhinoConnectApp());

    expect(find.text('Trusted bookings for local experiences'), findsOneWidget);

    await tester.pump(const Duration(milliseconds: 1100));
    await tester.pumpAndSettle();
    expect(find.text('Skip'), findsOneWidget);
    expect(find.text('Find trusted stays, treks, and retreats.'), findsOneWidget);

    await tester.tap(find.text('Skip'));
    await tester.pumpAndSettle();
    expect(find.text('Book premium local services anywhere.'), findsOneWidget);

    await tester.scrollUntilVisible(find.text('Login'), 250);
    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Create account'), findsOneWidget);
  });
}
