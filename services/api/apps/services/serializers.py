from decimal import Decimal

from django.utils.text import slugify
from rest_framework import serializers

from apps.categories.serializers import CategorySerializer
from apps.providers.models import ProviderProfile
from apps.providers.serializers import ProviderProfileSerializer

from .models import AvailabilityBlock, AvailabilityRule, ServiceListing, ServiceMedia


class ServiceMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceMedia
        fields = [
            "id",
            "service",
            "media_type",
            "url",
            "thumbnail_url",
            "title",
            "description",
            "sort_order",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            self.fields["service"].queryset = ServiceListing.objects.none()
        elif request.user.is_staff or getattr(request.user, "role", "") == "admin":
            self.fields["service"].queryset = ServiceListing.objects.all()
        else:
            self.fields["service"].queryset = ServiceListing.objects.filter(provider__owner=request.user)


class AvailabilityRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilityRule
        fields = ["id", "service", "weekday", "start_time", "end_time", "capacity", "active"]
        read_only_fields = ["id"]


class AvailabilityBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilityBlock
        fields = ["id", "service", "start_at", "end_at", "reason", "capacity_override", "created_at"]
        read_only_fields = ["id", "created_at"]


class ServiceListingSerializer(serializers.ModelSerializer):
    provider = serializers.PrimaryKeyRelatedField(queryset=ProviderProfile.objects.none(), required=False)
    provider_detail = ProviderProfileSerializer(source="provider", read_only=True)
    category_detail = CategorySerializer(source="category", read_only=True)
    media = ServiceMediaSerializer(many=True, read_only=True)
    slug = serializers.SlugField(required=False)

    class Meta:
        model = ServiceListing
        fields = [
            "id",
            "provider",
            "provider_detail",
            "category",
            "category_detail",
            "title",
            "slug",
            "description",
            "service_type",
            "base_price",
            "currency",
            "pricing_unit",
            "duration_minutes",
            "capacity",
            "deposit_percent",
            "instant_booking_enabled",
            "active",
            "rating_average",
            "rating_count",
            "media",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "rating_average", "rating_count", "created_at", "updated_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            self.fields["provider"].queryset = ProviderProfile.objects.none()
        elif request.user.is_staff or getattr(request.user, "role", "") == "admin":
            self.fields["provider"].queryset = ProviderProfile.objects.all()
        else:
            self.fields["provider"].queryset = ProviderProfile.objects.filter(owner=request.user)

    def validate_slug(self, value):
        return slugify(value)

    def validate(self, attrs):
        if "base_price" in attrs and attrs["base_price"] <= Decimal("0"):
            raise serializers.ValidationError({"base_price": "Base price must be greater than zero."})
        if "capacity" in attrs and attrs["capacity"] < 1:
            raise serializers.ValidationError({"capacity": "Capacity must be at least 1."})
        if "deposit_percent" in attrs and attrs["deposit_percent"] > 100:
            raise serializers.ValidationError({"deposit_percent": "Deposit percent cannot exceed 100."})
        if not attrs.get("slug") and attrs.get("title"):
            attrs["slug"] = slugify(attrs["title"])
        provider = attrs.get("provider") or getattr(self.instance, "provider", None)
        request = self.context.get("request")
        if provider is None and request and request.user.is_authenticated and self.instance is None:
            provider = ProviderProfile.objects.filter(owner=request.user).first()
            if provider:
                attrs["provider"] = provider
        slug = attrs.get("slug")
        if provider and slug:
            queryset = ServiceListing.objects.filter(provider=provider, slug=slug)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError({"slug": "This provider already has a service with this slug."})
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        provider = validated_data.get("provider")
        if provider is None:
            provider = ProviderProfile.objects.filter(owner=request.user).first()
            if provider is None:
                raise serializers.ValidationError({"provider": "Create a provider profile before adding services."})
            validated_data["provider"] = provider
        return super().create(validated_data)
