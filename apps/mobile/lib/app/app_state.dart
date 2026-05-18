import 'package:flutter/widgets.dart';

import '../core/api/api_client.dart';
import '../core/models/models.dart';

class AppState extends ChangeNotifier {
  AppState({ApiClient? apiClient}) : apiClient = apiClient ?? ApiClient();

  final ApiClient apiClient;

  UserProfile? currentUser;
  bool splashComplete = false;
  bool onboardingComplete = false;
  int tabIndex = 0;
  String category = 'All';
  String searchQuery = '';
  bool loadingServices = false;
  bool loadingBookings = false;
  String? lastError;
  List<ServiceListing> services = [];
  List<CustomerBooking> bookings = [];

  bool get isAuthenticated => currentUser != null;

  void completeSplash() {
    splashComplete = true;
    notifyListeners();
  }

  void completeOnboarding() {
    onboardingComplete = true;
    notifyListeners();
  }

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

  Future<void> loadServices() async {
    loadingServices = true;
    lastError = null;
    notifyListeners();
    try {
      services = await apiClient.listServices();
      if (!categories.contains(category)) category = 'All';
    } catch (error) {
      lastError = _messageFor(error);
      rethrow;
    } finally {
      loadingServices = false;
      notifyListeners();
    }
  }

  Future<void> loadBookings() async {
    if (!isAuthenticated) return;
    loadingBookings = true;
    lastError = null;
    notifyListeners();
    try {
      bookings = await apiClient.listBookings();
    } catch (error) {
      lastError = _messageFor(error);
      rethrow;
    } finally {
      loadingBookings = false;
      notifyListeners();
    }
  }

  Future<void> signIn({required String email, required String password}) async {
    try {
      final session = await apiClient.login(email: email, password: password);
      apiClient.setToken(session.token);
      currentUser = session.user;
      lastError = null;
      notifyListeners();
      await loadServices();
      await loadBookings();
    } catch (error) {
      lastError = _messageFor(error);
      notifyListeners();
      rethrow;
    }
  }

  Future<void> register({required String name, required String email, required String password, required String country}) async {
    try {
      final session = await apiClient.register(name: name, email: email, password: password, country: country);
      apiClient.setToken(session.token);
      currentUser = session.user;
      lastError = null;
      notifyListeners();
      await loadServices();
      await loadBookings();
    } catch (error) {
      lastError = _messageFor(error);
      notifyListeners();
      rethrow;
    }
  }

  void signOut() {
    currentUser = null;
    apiClient.setToken(null);
    bookings = [];
    tabIndex = 0;
    notifyListeners();
  }

  Future<CustomerBooking> createBooking(BookingDraft draft) async {
    try {
      final booking = await apiClient.createBooking(draft);
      bookings.insert(0, booking);
      tabIndex = 3;
      notifyListeners();
      return booking;
    } catch (error) {
      lastError = _messageFor(error);
      notifyListeners();
      rethrow;
    }
  }

  Future<void> markDepositPaid(String reference) async {
    final index = bookings.indexWhere((booking) => booking.reference == reference);
    if (index == -1) return;
    try {
      await apiClient.markDepositPaid(bookings[index].id);
      bookings[index] = bookings[index].copyWith(paymentStatus: 'Partial');
      notifyListeners();
    } catch (error) {
      lastError = _messageFor(error);
      notifyListeners();
      rethrow;
    }
  }
}

String _messageFor(Object error) {
  if (error is ApiException) {
    final apiError = error.payload['error'];
    final detail = error.payload['detail'] ??
        error.payload['non_field_errors'] ??
        error.payload['email'] ??
        (apiError is Map ? apiError['message'] : null);
    return detail?.toString() ?? 'API request failed (${error.statusCode}).';
  }
  return error.toString();
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
