from django.contrib import admin

from .models import ProviderProfile


@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    list_display = ("business_name", "owner", "city", "country", "verification_status", "rating_average")
    list_filter = ("verification_status", "country", "city")
    search_fields = ("business_name", "slug", "owner__email", "city", "country")
    prepopulated_fields = {"slug": ("business_name",)}
