from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("booking_ref", "customer", "provider", "service", "status", "payment_status", "total_amount")
    list_filter = ("status", "payment_status", "currency")
    search_fields = ("booking_ref", "customer__email", "provider__business_name", "service__title")
    date_hierarchy = "start_at"
