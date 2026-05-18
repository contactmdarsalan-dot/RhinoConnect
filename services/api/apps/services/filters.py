import django_filters

from .models import ServiceListing


class ServiceListingFilter(django_filters.FilterSet):
    category_slug = django_filters.CharFilter(field_name="category__slug", lookup_expr="iexact")
    provider_slug = django_filters.CharFilter(field_name="provider__slug", lookup_expr="iexact")
    city = django_filters.CharFilter(field_name="provider__city", lookup_expr="icontains")
    country = django_filters.CharFilter(field_name="provider__country", lookup_expr="icontains")
    min_price = django_filters.NumberFilter(field_name="base_price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="base_price", lookup_expr="lte")

    class Meta:
        model = ServiceListing
        fields = [
            "category",
            "category_slug",
            "provider",
            "provider_slug",
            "service_type",
            "active",
            "instant_booking_enabled",
            "currency",
            "city",
            "country",
            "min_price",
            "max_price",
        ]
