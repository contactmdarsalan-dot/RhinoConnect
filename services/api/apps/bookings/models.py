from django.conf import settings
from django.db import models


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"
        DISPUTED = "disputed", "Disputed"

    class PaymentStatus(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PARTIAL = "partial", "Partial"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    booking_ref = models.CharField(max_length=24, unique=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="bookings")
    provider = models.ForeignKey("providers.ProviderProfile", on_delete=models.PROTECT, related_name="bookings")
    service = models.ForeignKey("services.ServiceListing", on_delete=models.PROTECT, related_name="bookings")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    guests = models.PositiveIntegerField(default=1)
    subtotal_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    provider_payout_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="NPR")
    notes = models.TextField(blank=True)
    cancellation_reason = models.CharField(max_length=240, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["booking_ref"]),
            models.Index(fields=["customer", "status"]),
            models.Index(fields=["provider", "status"]),
            models.Index(fields=["service", "start_at", "end_at"]),
            models.Index(fields=["payment_status"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.booking_ref
