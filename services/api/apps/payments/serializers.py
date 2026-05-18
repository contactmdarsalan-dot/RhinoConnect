from rest_framework import serializers

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
