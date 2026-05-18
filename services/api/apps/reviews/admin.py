from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("booking", "customer", "provider", "service", "rating", "created_at")
    list_filter = ("rating",)
    search_fields = ("booking__booking_ref", "customer__email", "provider__business_name", "service__title")
