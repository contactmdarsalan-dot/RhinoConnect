import secrets
from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.providers.serializers import ProviderProfileSerializer
from apps.services.models import ServiceListing
from apps.services.serializers import ServiceListingSerializer

from .models import Booking


def generate_booking_ref():
    while True:
        candidate = f"RHC-{timezone.now():%y%m%d}-{secrets.token_hex(3).upper()}"
        if not Booking.objects.filter(booking_ref=candidate).exists():
            return candidate


class BookingSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    provider = ProviderProfileSerializer(read_only=True)
    service = ServiceListingSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceListing.objects.filter(active=True),
        source="service",
        write_only=True,
    )

    class Meta:
        model = Booking
        fields = [
            "id",
            "booking_ref",
            "customer",
            "provider",
            "service",
            "service_id",
            "status",
            "payment_status",
            "start_at",
            "end_at",
            "guests",
            "subtotal_amount",
            "discount_amount",
            "commission_amount",
            "provider_payout_amount",
            "total_amount",
            "currency",
            "notes",
            "cancellation_reason",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "booking_ref",
            "customer",
            "provider",
            "status",
            "payment_status",
            "subtotal_amount",
            "discount_amount",
            "commission_amount",
            "provider_payout_amount",
            "total_amount",
            "currency",
            "cancellation_reason",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        service = attrs.get("service")
        start_at = attrs.get("start_at")
        end_at = attrs.get("end_at")
        guests = attrs.get("guests", 1)

        if start_at and end_at and end_at <= start_at:
            raise serializers.ValidationError({"end_at": "End date must be after start date."})
        if guests < 1:
            raise serializers.ValidationError({"guests": "Guest count must be at least 1."})
        if service and guests > service.capacity:
            raise serializers.ValidationError({"guests": "Guest count exceeds this service capacity."})

        if service and start_at and end_at:
            active_statuses = [
                Booking.Status.PENDING,
                Booking.Status.CONFIRMED,
                Booking.Status.COMPLETED,
                Booking.Status.DISPUTED,
            ]
            booked_guests = (
                Booking.objects.filter(
                    service=service,
                    status__in=active_statuses,
                    start_at__lt=end_at,
                    end_at__gt=start_at,
                ).aggregate(total=Sum("guests"))["total"]
                or 0
            )
            if booked_guests + guests > service.capacity:
                raise serializers.ValidationError("This service does not have enough availability for those dates.")

        return attrs

    def create(self, validated_data):
        service = validated_data["service"]
        total = service.base_price
        commission = (total * Decimal("0.10")).quantize(Decimal("0.01"))

        return Booking.objects.create(
            booking_ref=generate_booking_ref(),
            customer=self.context["request"].user,
            provider=service.provider,
            subtotal_amount=total,
            commission_amount=commission,
            provider_payout_amount=total - commission,
            total_amount=total,
            currency=service.currency,
            status=Booking.Status.CONFIRMED if service.instant_booking_enabled else Booking.Status.PENDING,
            **validated_data,
        )


class BookingStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Booking.Status.choices)
    cancellation_reason = serializers.CharField(required=False, allow_blank=True, max_length=240)

    def validate_status(self, value):
        booking = self.context["booking"]
        allowed = {
            Booking.Status.PENDING: {
                Booking.Status.CONFIRMED,
                Booking.Status.REJECTED,
                Booking.Status.CANCELLED,
            },
            Booking.Status.CONFIRMED: {
                Booking.Status.COMPLETED,
                Booking.Status.CANCELLED,
                Booking.Status.DISPUTED,
            },
            Booking.Status.DISPUTED: {
                Booking.Status.CANCELLED,
                Booking.Status.COMPLETED,
            },
        }
        if value == booking.status:
            return value
        if value not in allowed.get(booking.status, set()):
            raise serializers.ValidationError(f"Cannot change booking from {booking.status} to {value}.")
        return value
