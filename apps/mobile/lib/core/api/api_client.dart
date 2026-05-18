import 'dart:convert';
import 'dart:io';

import '../models/models.dart';

class ApiClient {
  ApiClient({
    this.baseUrl = const String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.0.2.2:3000/api/v1'),
  });

  final String baseUrl;
  String? _token;

  void setToken(String? token) {
    _token = token;
  }

  Future<Map<String, dynamic>> getJson(String path) async {
    final request = await _request('GET', path);
    final response = await request.close();
    return _decode(response);
  }

  Future<Map<String, dynamic>> postJson(String path, Map<String, dynamic> body) async {
    final request = await _request('POST', path);
    request.write(jsonEncode(body));
    final response = await request.close();
    return _decode(response);
  }

  Future<AuthSession> register({
    required String name,
    required String email,
    required String password,
    required String country,
  }) async {
    final parts = name.trim().split(RegExp(r'\s+')).where((part) => part.isNotEmpty).toList();
    final payload = await postJson('/auth/register', {
      'name': name.trim(),
      'email': email.trim(),
      'password': password,
      'first_name': parts.isEmpty ? name.trim() : parts.first,
      'last_name': parts.length <= 1 ? '' : parts.sublist(1).join(' '),
      'country': country.trim(),
    });
    return AuthSession.fromJson(payload);
  }

  Future<AuthSession> login({required String email, required String password}) async {
    final payload = await postJson('/auth/login', {
      'email': email.trim(),
      'password': password,
    });
    return AuthSession.fromJson(payload);
  }

  Future<UserProfile> me() async {
    return UserProfile.fromJson(await getJson('/auth/me'));
  }

  Future<List<ServiceListing>> listServices() async {
    return _extractList(await getJson('/services')).map(ServiceListing.fromJson).toList();
  }

  Future<List<CustomerBooking>> listBookings() async {
    return _extractList(await getJson('/bookings')).map(CustomerBooking.fromJson).toList();
  }

  Future<CustomerBooking> createBooking(BookingDraft draft) async {
    final payload = await postJson('/bookings', {
      'service_id': draft.service.id,
      'start_at': draft.startDate.toUtc().toIso8601String(),
      'end_at': draft.endDate.toUtc().toIso8601String(),
      'guests': draft.guests,
      'notes': draft.notes,
    });
    return CustomerBooking.fromJson(payload);
  }

  Future<void> markDepositPaid(String bookingId) async {
    final intent = await postJson('/payments/intents', {
      'booking': bookingId,
      'payment_kind': 'deposit',
      'gateway': 'test',
    });
    final payment = intent['payment'];
    if (payment is Map && payment['id'] != null) {
      await postJson('/payments/${payment['id']}/mark-succeeded', {});
    }
  }

  Future<HttpClientRequest> _request(String method, String path) async {
    final uri = Uri.parse('$baseUrl$path');
    final client = HttpClient();
    final request = await client.openUrl(method, uri);
    request.headers.contentType = ContentType.json;
    request.headers.set(HttpHeaders.acceptHeader, 'application/json');
    if (_token != null) {
      request.headers.set(HttpHeaders.authorizationHeader, 'Token $_token');
    }
    return request;
  }

  Future<Map<String, dynamic>> _decode(HttpClientResponse response) async {
    final payload = await utf8.decodeStream(response);
    final decoded = payload.isEmpty ? <String, dynamic>{} : jsonDecode(payload) as Map<String, dynamic>;
    if (response.statusCode >= 400) {
      throw ApiException(response.statusCode, decoded);
    }
    return decoded;
  }

  List<Map<String, dynamic>> _extractList(Map<String, dynamic> payload) {
    List raw = const [];
    if (payload['results'] is List) {
      raw = payload['results'] as List;
    } else {
      for (final value in payload.values) {
        if (value is List) {
          raw = value;
          break;
        }
      }
    }
    return raw.whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
  }
}

class AuthSession {
  const AuthSession({required this.token, required this.user});

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      token: json['token'].toString(),
      user: UserProfile.fromJson(Map<String, dynamic>.from(json['user'] as Map)),
    );
  }

  final String token;
  final UserProfile user;
}

class ApiException implements Exception {
  ApiException(this.statusCode, this.payload);

  final int statusCode;
  final Map<String, dynamic> payload;

  @override
  String toString() => 'API $statusCode: $payload';
}
