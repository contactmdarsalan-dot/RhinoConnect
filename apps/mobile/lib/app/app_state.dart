import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import '../core/api/api_client.dart';
import '../core/data/demo_data.dart';
import '../core/models/models.dart';

class AppState extends ChangeNotifier {
  AppState({ApiClient? apiClient}) : apiClient = apiClient ?? ApiClient();

  final ApiClient apiClient;

  UserProfile? currentUser;
  int tabIndex = 0;
  String category = 'All';
  String searchQuery = '';
  List<ServiceListing> services = List.of(DemoData.services);
  final List<CustomerBooking> bookings = [];

  bool get isAuthenticated => currentUser != null;

  List<String> get categories => ['All', ...services.map((service) => service.category).toSet()];

  List<ServiceListing> get visibleServices {
    final query = searchQuery.trim().toLowerCase();
    return services.where((service) {
      final categoryMatches = category == 'All' || service.category == category;
      final queryMatches = query.isEmpty ||
          service.title.toLowerCase().contains(query) ||
          service.description.toLowerCase().contains(query) ||
          service.locationLabel.toLowerCase().contains(query);
      return categoryMatches && queryMatches;
    }).toList();
  }

  void setTab(int index) {
    tabIndex = index;
    notifyListeners();
  }

  void setCategory(String value) {
    category = value;
    notifyListeners();
  }

  void setSearchQuery(String value) {
    searchQuery = value;
    notifyListeners();
  }

  void signIn({required String email, required String password}) {
    currentUser = UserProfile(name: 'Arjun Thapa', email: email, country: 'Nepal');
    notifyListeners();
  }

  void register({required String name, required String email, required String country}) {
    currentUser = UserProfile(name: name, email: email, country: country);
    notifyListeners();
  }

  void signOut() {
    currentUser = null;
    tabIndex = 0;
    notifyListeners();
  }

  CustomerBooking createBooking(BookingDraft draft) {
    final booking = CustomerBooking(
      reference: 'RHC-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      service: draft.service,
      startDate: draft.startDate,
      endDate: draft.endDate,
      guests: draft.guests,
      status: 'Pending',
      paymentStatus: 'Unpaid',
    );
    bookings.insert(0, booking);
    tabIndex = 1;
    notifyListeners();
    return booking;
  }

  void markDepositPaid(String reference) {
    final index = bookings.indexWhere((booking) => booking.reference == reference);
    if (index == -1) return;
    bookings[index] = bookings[index].copyWith(paymentStatus: 'Partial');
    notifyListeners();
  }
}

class AppStateScope extends InheritedNotifier<AppState> {
  const AppStateScope({
    required AppState super.notifier,
    required super.child,
    super.key,
  });

  static AppState of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppStateScope>();
    assert(scope != null, 'AppStateScope is missing from the widget tree.');
    return scope!.notifier!;
  }
}
