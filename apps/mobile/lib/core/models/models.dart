enum MediaType { image, video }

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

  final int id;
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
    required this.reference,
    required this.service,
    required this.startDate,
    required this.endDate,
    required this.guests,
    required this.status,
    required this.paymentStatus,
  });

  final String reference;
  final ServiceListing service;
  final DateTime startDate;
  final DateTime endDate;
  final int guests;
  final String status;
  final String paymentStatus;

  CustomerBooking copyWith({String? status, String? paymentStatus}) {
    return CustomerBooking(
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
