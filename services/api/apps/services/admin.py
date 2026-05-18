from django.contrib import admin

from .models import AvailabilityBlock, AvailabilityRule, ServiceListing, ServiceMedia


class ServiceMediaInline(admin.TabularInline):
    model = ServiceMedia
    extra = 1


class AvailabilityRuleInline(admin.TabularInline):
    model = AvailabilityRule
    extra = 1


@admin.register(ServiceListing)
class ServiceListingAdmin(admin.ModelAdmin):
    inlines = [ServiceMediaInline, AvailabilityRuleInline]
    list_display = ("title", "provider", "service_type", "base_price", "currency", "active", "rating_average")
    list_filter = ("service_type", "active", "currency", "category")
    search_fields = ("title", "slug", "provider__business_name")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(AvailabilityBlock)
class AvailabilityBlockAdmin(admin.ModelAdmin):
    list_display = ("service", "start_at", "end_at", "capacity_override", "reason")
    list_filter = ("service",)
    search_fields = ("service__title", "reason")
