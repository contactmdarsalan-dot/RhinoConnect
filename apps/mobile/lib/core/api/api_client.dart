import 'dart:convert';
import 'dart:io';

class ApiClient {
  ApiClient({
    this.baseUrl = const String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.0.2.2:8000/api/v1'),
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
}

class ApiException implements Exception {
  ApiException(this.statusCode, this.payload);

  final int statusCode;
  final Map<String, dynamic> payload;

  @override
  String toString() => 'API $statusCode: $payload';
}
