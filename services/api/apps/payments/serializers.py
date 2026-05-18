import secrets
from decimal import Decimal

from django.db.models import Sum
from rest_framework import serializers

from apps.bookings.models import Booking

from .models import Payment, Payout


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "booking",
            "provider",
            "customer",
            "gateway",
            "gateway_payment_id",
            "amount",
            "currency",
            "status",
            "paid_at",
            "created_at",
        ]
        read_only_fields = fields


class PaymentIntentSerializer(serializers.Serializer):
    class PaymentKind:
        DEPOSIT = "deposit"
        FULL = "full"

    booking = serializers.PrimaryKeyRelatedField(queryset=Booking.objects.all())
    payment_kind = serializers.ChoiceField(choices=[PaymentKind.DEPOSIT, PaymentKind.FULL], default=PaymentKind.DEPOSIT)
    gateway = serializers.ChoiceField(choices=["test", "manual", "stripe", "esewa", "khalti"], default="test")

    def validate_booking(self, booking):
        request = self.context["request"]
        if booking.customer_id != request.user.id:
            raise serializers.ValidationError("You can only pay for your own bookings.")
        if booking.status in {Booking.Status.REJECTED, Booking.Status.CANCELLED}:
            raise serializers.ValidationError("This booking cannot accept payments.")
        if booking.payment_status == Booking.PaymentStatus.PAID:
            raise serializers.ValidationError("This booking is already paid.")
        return booking

    def create(self, validated_data):
        booking = validated_data["booking"]
        payment_kind = validated_data["payment_kind"]
        paid_total = (
            Payment.objects.filter(booking=booking, status=Payment.Status.SUCCEEDED).aggregate(total=Sum("amount"))[
                "total"
            ]
            or Decimal("0")
        )
        remaining_total = booking.total_amount - paid_total
        deposit_amount = (booking.total_amount * Decimal(booking.service.deposit_percent) / Decimal("100")).quantize(
            Decimal("0.01")
        )
        amount = remaining_total if payment_kind == self.PaymentKind.FULL else min(deposit_amount, remaining_total)
        if amount <= Decimal("0"):
            raise serializers.ValidationError("This booking has no remaining payable amount.")

        return Payment.objects.create(
            booking=booking,
            provider=booking.provider,
            customer=booking.customer,
            gateway=validated_data["gateway"],
            gateway_payment_id=f"pi_test_{secrets.token_hex(8)}",
            amount=amount,
            currency=booking.currency,
            status=Payment.Status.REQUIRES_PAYMENT,
        )


class PaymentIntentResponseSerializer(serializers.Serializer):
    payment = PaymentSerializer()
    client_secret = serializers.CharField()
    mode = serializers.CharField()


class PayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payout
        fields = [
            "id",
            "provider",
            "booking",
            "amount",
            "currency",
            "status",
            "scheduled_at",
            "paid_at",
            "created_at",
        ]
        read_only_fields = fields
