enum MediaType { image, video }

String _stringValue(Object? value, [String fallback = '']) {
  if (value == null) return fallback;
  return value.toString();
}

int _intValue(Object? value, [int fallback = 0]) {
  if (value is int) return value;
  if (value is num) return value.round();
  return int.tryParse(_stringValue(value)) ?? fallback;
}

num _numValue(Object? value, [num fallback = 0]) {
  if (value is num) return value;
  return num.tryParse(_stringValue(value)) ?? fallback;
}

String _titleCase(String value) {
  if (value.isEmpty) return value;
  return value[0].toUpperCase() + value.substring(1).replaceAll('_', ' ');
}

String money(num value, {String currency = 'NPR'}) {
  final rounded = value.round().toString();
  final buffer = StringBuffer();
  for (var i = 0; i < rounded.length; i += 1) {
    final remaining = rounded.length - i;
    buffer.write(rounded[i]);
    if (remaining > 1 && remaining % 3 == 1) {
      buffer.write(',');
    }
  }
  return currency == 'NPR' ? 'Rs. $buffer' : '$currency $buffer';
}

class UserProfile {
  const UserProfile({
    required this.name,
    required this.email,
    required this.country,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    final fullName = _stringValue(json['full_name']).trim();
    final firstName = _stringValue(json['first_name']).trim();
    final lastName = _stringValue(json['last_name']).trim();
    final displayName = fullName.isNotEmpty
        ? fullName
        : [firstName, lastName].where((part) => part.isNotEmpty).join(' ').trim();
    return UserProfile(
      name: displayName.isNotEmpty ? displayName : _stringValue(json['username'], 'RhinoConnect user'),
      email: _stringValue(json['email']),
      country: _stringValue(json['country'], 'Nepal'),
    );
  }

  final String name;
  final String email;
  final String country;
}

class ServiceMedia {
  const ServiceMedia({
    required this.type,
    required this.url,
    required this.title,
    this.thumbnailUrl,
    this.description = '',
  });

  final MediaType type;
  final String url;
  final String title;
  final String? thumbnailUrl;
  final String description;

  factory ServiceMedia.fromJson(Map<String, dynamic> json) {
    final rawType = _stringValue(json['media_type'] ?? json['type']);
    return ServiceMedia(
      type: rawType == 'video' ? MediaType.video : MediaType.image,
      url: _stringValue(json['url']),
      title: _stringValue(json['title'], rawType == 'video' ? 'Video preview' : 'Image preview'),
      thumbnailUrl: _stringValue(json['thumbnail_url'] ?? json['thumbnailUrl']).trim().isEmpty
          ? null
          : _stringValue(json['thumbnail_url'] ?? json['thumbnailUrl']),
      description: _stringValue(json['description']),
    );
  }
}

class ProviderSummary {
  const ProviderSummary({
    required this.name,
    required this.city,
    required this.country,
    required this.rating,
    required this.reviewCount,
    required this.verified,
  });

  final String name;
  final String city;
  final String country;
  final double rating;
  final int reviewCount;
  final bool verified;

  factory ProviderSummary.fromJson(Map<String, dynamic>? json) {
    final data = json ?? const <String, dynamic>{};
    return ProviderSummary(
      name: _stringValue(data['business_name'] ?? data['name'], 'Verified provider'),
      city: _stringValue(data['city'], 'Kathmandu'),
      country: _stringValue(data['country'], 'Nepal'),
      rating: _numValue(data['rating_average'] ?? data['rating'], 0).toDouble(),
      reviewCount: _intValue(data['rating_count'] ?? data['reviewCount'], 0),
      verified: _stringValue(data['verification_status'], 'verified') == 'verified' || data['verified'] == true,
    );
  }
}

class ServiceListing {
  const ServiceListing({
    required this.id,
    required this.title,
    required this.category,
    required this.serviceType,
    required this.description,
    required this.basePrice,
    required this.currency,
    required this.durationLabel,
    required this.capacity,
    required this.depositPercent,
    required this.provider,
    required this.media,
    required this.highlights,
  });

  final String id;
  final String title;
  final String category;
  final String serviceType;
  final String description;
  final num basePrice;
  final String currency;
  final String durationLabel;
  final int capacity;
  final int depositPercent;
  final ProviderSummary provider;
  final List<ServiceMedia> media;
  final List<String> highlights;

  factory ServiceListing.fromJson(Map<String, dynamic> json) {
    final mediaItems = (json['media'] is List ? json['media'] as List : const [])
        .whereType<Map>()
        .map((item) => ServiceMedia.fromJson(Map<String, dynamic>.from(item)))
        .toList();
    final category = json['category_detail'] is Map
        ? _stringValue((json['category_detail'] as Map)['name'])
        : _titleCase(_stringValue(json['service_type'], 'Service'));
    final serviceType = _titleCase(_stringValue(json['service_type'], 'service'));
    final durationMinutes = _intValue(json['duration_minutes'], 60);

    return ServiceListing(
      id: _stringValue(json['id']),
      title: _stringValue(json['title'], 'Untitled service'),
      category: category.isEmpty ? serviceType : category,
      serviceType: serviceType,
      description: _stringValue(json['description']),
      basePrice: _numValue(json['base_price']),
      currency: _stringValue(json['currency'], 'NPR'),
      durationLabel: _durationLabel(durationMinutes),
      capacity: _intValue(json['capacity'], 1),
      depositPercent: _intValue(json['deposit_percent'], 30),
      provider: ProviderSummary.fromJson(
        json['provider_detail'] is Map ? Map<String, dynamic>.from(json['provider_detail'] as Map) : null,
      ),
      media: mediaItems,
      highlights: [
        if (json['instant_booking_enabled'] == true) 'Instant booking',
        '$serviceType service',
        '${_intValue(json['deposit_percent'], 30)}% deposit',
        'Capacity ${_intValue(json['capacity'], 1)}',
      ],
    );
  }

  String get priceLabel => money(basePrice, currency: currency);
  String get locationLabel => '${provider.city}, ${provider.country}';
  ServiceMedia? get cover => media.isEmpty ? null : media.first;
}

class BookingDraft {
  const BookingDraft({
    required this.service,
    required this.startDate,
    required this.endDate,
    required this.guests,
    required this.country,
    required this.notes,
  });

  final ServiceListing service;
  final DateTime startDate;
  final DateTime endDate;
  final int guests;
  final String country;
  final String notes;
}

class CustomerBooking {
  const CustomerBooking({
    required this.id,
    required this.reference,
    required this.service,
    required this.startDate,
    required this.endDate,
    required this.guests,
    required this.status,
    required this.paymentStatus,
  });

  factory CustomerBooking.fromJson(Map<String, dynamic> json) {
    final serviceJson = json['service'] is Map ? Map<String, dynamic>.from(json['service'] as Map) : <String, dynamic>{};
    return CustomerBooking(
      id: _stringValue(json['id']),
      reference: _stringValue(json['booking_ref'], 'RHC-${_stringValue(json['id'])}'),
      service: ServiceListing.fromJson(serviceJson),
      startDate: DateTime.tryParse(_stringValue(json['start_at'])) ?? DateTime.now(),
      endDate: DateTime.tryParse(_stringValue(json['end_at'])) ?? DateTime.now().add(const Duration(days: 1)),
      guests: _intValue(json['guests'], 1),
      status: _titleCase(_stringValue(json['status'], 'pending')),
      paymentStatus: _titleCase(_stringValue(json['payment_status'], 'unpaid')),
    );
  }

  final String id;
  final String reference;
  final ServiceListing service;
  final DateTime startDate;
  final DateTime endDate;
  final int guests;
  final String status;
  final String paymentStatus;

  CustomerBooking copyWith({String? status, String? paymentStatus}) {
    return CustomerBooking(
      id: id,
      reference: reference,
      service: service,
      startDate: startDate,
      endDate: endDate,
      guests: guests,
      status: status ?? this.status,
      paymentStatus: paymentStatus ?? this.paymentStatus,
    );
  }
}

String _durationLabel(int minutes) {
  if (minutes >= 1440) {
    final days = (minutes / 1440).round();
    return '$days ${days == 1 ? 'day' : 'days'}';
  }
  if (minutes >= 60) {
    final hours = (minutes / 60).round();
    return '$hours ${hours == 1 ? 'hour' : 'hours'}';
  }
  return '$minutes min';
}
