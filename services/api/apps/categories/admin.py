from django.contrib import admin

from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "active", "sort_order")
    list_filter = ("active", "parent")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
