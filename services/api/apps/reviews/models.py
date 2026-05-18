from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Review(models.Model):
    booking = models.OneToOneField("bookings.Booking", on_delete=models.CASCADE, related_name="review")
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="reviews")
    provider = models.ForeignKey("providers.ProviderProfile", on_delete=models.PROTECT, related_name="reviews")
    service = models.ForeignKey("services.ServiceListing", on_delete=models.PROTECT, related_name="reviews")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    provider_reply = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["provider", "rating"]),
            models.Index(fields=["service", "rating"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.service} - {self.rating}/5"
