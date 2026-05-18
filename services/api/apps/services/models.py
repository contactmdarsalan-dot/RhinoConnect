from django.db import models


class ServiceListing(models.Model):
    class ServiceType(models.TextChoices):
        HOTEL = "hotel", "Hotel"
        HOMESTAY = "homestay", "Homestay"
        TREKKING = "trekking", "Trekking"
        TRAVEL = "travel", "Travel"
        CAFE = "cafe", "Cafe"
        WELLNESS = "wellness", "Wellness"
        EVENT = "event", "Event"
        HOME = "home", "Home Service"
        LOCAL = "local", "Local Service"

    provider = models.ForeignKey("providers.ProviderProfile", on_delete=models.CASCADE, related_name="services")
    category = models.ForeignKey("categories.Category", on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200)
    description = models.TextField()
    service_type = models.CharField(max_length=30, choices=ServiceType.choices, default=ServiceType.LOCAL)
    base_price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="NPR")
    pricing_unit = models.CharField(max_length=40, default="booking")
    duration_minutes = models.PositiveIntegerField(default=60)
    capacity = models.PositiveIntegerField(default=1)
    deposit_percent = models.PositiveIntegerField(default=30)
    instant_booking_enabled = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    rating_average = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["provider", "slug"], name="unique_service_slug_per_provider"),
        ]
        indexes = [
            models.Index(fields=["active", "service_type"]),
            models.Index(fields=["category", "active"]),
            models.Index(fields=["base_price"]),
            models.Index(fields=["rating_average"]),
        ]
        ordering = ["title"]

    def __str__(self) -> str:
        return self.title


class ServiceMedia(models.Model):
    class MediaType(models.TextChoices):
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"

    service = models.ForeignKey(ServiceListing, on_delete=models.CASCADE, related_name="media")
    media_type = models.CharField(max_length=10, choices=MediaType.choices)
    url = models.URLField(max_length=700)
    thumbnail_url = models.URLField(max_length=700, blank=True)
    title = models.CharField(max_length=140)
    description = models.CharField(max_length=280, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "created_at"]

    def __str__(self) -> str:
        return f"{self.service} - {self.title}"


class AvailabilityRule(models.Model):
    class Weekday(models.IntegerChoices):
        MONDAY = 0, "Monday"
        TUESDAY = 1, "Tuesday"
        WEDNESDAY = 2, "Wednesday"
        THURSDAY = 3, "Thursday"
        FRIDAY = 4, "Friday"
        SATURDAY = 5, "Saturday"
        SUNDAY = 6, "Sunday"

    service = models.ForeignKey(ServiceListing, on_delete=models.CASCADE, related_name="availability_rules")
    weekday = models.PositiveSmallIntegerField(choices=Weekday.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    capacity = models.PositiveIntegerField(default=1)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["weekday", "start_time"]


class AvailabilityBlock(models.Model):
    service = models.ForeignKey(ServiceListing, on_delete=models.CASCADE, related_name="availability_blocks")
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    reason = models.CharField(max_length=180, blank=True)
    capacity_override = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["service", "start_at", "end_at"]),
        ]
        ordering = ["-start_at"]
