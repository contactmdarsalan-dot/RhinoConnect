from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class RhinoConnectUserAdmin(UserAdmin):
    list_display = ("email", "username", "role", "is_verified", "is_staff", "is_active")
    list_filter = ("role", "is_verified", "is_staff", "is_active")
    search_fields = ("email", "username", "first_name", "last_name", "phone")
    fieldsets = UserAdmin.fieldsets + (
        ("Marketplace profile", {"fields": ("role", "phone", "country", "avatar_url", "is_verified")}),
    )
