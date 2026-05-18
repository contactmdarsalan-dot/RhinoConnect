from django.contrib import admin

from .models import Payment, Payout


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("booking", "customer", "provider", "gateway", "amount", "currency", "status")
    list_filter = ("gateway", "status", "currency")
    search_fields = ("booking__booking_ref", "customer__email", "gateway_payment_id")


@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ("booking", "provider", "amount", "currency", "status", "scheduled_at", "paid_at")
    list_filter = ("status", "currency")
    search_fields = ("booking__booking_ref", "provider__business_name")
