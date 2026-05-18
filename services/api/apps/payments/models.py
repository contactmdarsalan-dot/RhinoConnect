from django.conf import settings
from django.db import models


class Payment(models.Model):
    class Status(models.TextChoices):
        REQUIRES_PAYMENT = "requires_payment", "Requires Payment"
        PROCESSING = "processing", "Processing"
        SUCCEEDED = "succeeded", "Succeeded"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    booking = models.ForeignKey("bookings.Booking", on_delete=models.CASCADE, related_name="payments")
    provider = models.ForeignKey("providers.ProviderProfile", on_delete=models.PROTECT, related_name="payments")
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="payments")
    gateway = models.CharField(max_length=40, default="manual")
    gateway_payment_id = models.CharField(max_length=140, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="NPR")
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.REQUIRES_PAYMENT)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["booking", "status"]),
            models.Index(fields=["gateway", "gateway_payment_id"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.booking} - {self.amount} {self.currency}"


class Payout(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SCHEDULED = "scheduled", "Scheduled"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"

    provider = models.ForeignKey("providers.ProviderProfile", on_delete=models.PROTECT, related_name="payouts")
    booking = models.ForeignKey("bookings.Booking", on_delete=models.PROTECT, related_name="payouts")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="NPR")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["provider", "status"]),
            models.Index(fields=["booking"]),
        ]
        ordering = ["-created_at"]
