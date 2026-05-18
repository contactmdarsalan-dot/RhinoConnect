from django.db.models import Avg, Count
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.bookings.models import Booking
from apps.providers.serializers import ProviderProfileSerializer
from apps.services.serializers import ServiceListingSerializer

from .models import Review


def refresh_rating_totals(provider, service):
    provider_totals = provider.reviews.aggregate(average=Avg("rating"), count=Count("id"))
    provider.rating_average = provider_totals["average"] or 0
    provider.rating_count = provider_totals["count"] or 0
    provider.save(update_fields=["rating_average", "rating_count", "updated_at"])

    service_totals = service.reviews.aggregate(average=Avg("rating"), count=Count("id"))
    service.rating_average = service_totals["average"] or 0
    service.rating_count = service_totals["count"] or 0
    service.save(update_fields=["rating_average", "rating_count", "updated_at"])


class ReviewSerializer(serializers.ModelSerializer):
    booking_id = serializers.PrimaryKeyRelatedField(
        source="booking",
        queryset=Booking.objects.all(),
        write_only=True,
    )
    customer = UserSerializer(read_only=True)
    provider = ProviderProfileSerializer(read_only=True)
    service = ServiceListingSerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "booking_id",
            "booking",
            "customer",
            "provider",
            "service",
            "rating",
            "comment",
            "provider_reply",
            "created_at",
        ]
        read_only_fields = ["id", "booking", "customer", "provider", "service", "provider_reply", "created_at"]

    def validate_booking_id(self, booking):
        request = self.context["request"]
        if booking.customer_id != request.user.id:
            raise serializers.ValidationError("You can only review your own bookings.")
        if booking.status != Booking.Status.COMPLETED:
            raise serializers.ValidationError("Only completed bookings can be reviewed.")
        if hasattr(booking, "review"):
            raise serializers.ValidationError("This booking already has a review.")
        return booking

    def create(self, validated_data):
        booking = validated_data["booking"]
        review = Review.objects.create(
            customer=self.context["request"].user,
            provider=booking.provider,
            service=booking.service,
            **validated_data,
        )
        refresh_rating_totals(review.provider, review.service)
        return review
