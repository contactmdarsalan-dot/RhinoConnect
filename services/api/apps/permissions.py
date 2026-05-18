from rest_framework import permissions


def is_staff_user(user):
    return bool(user and user.is_authenticated and (user.is_staff or getattr(user, "role", "") == "admin"))


class IsStaffOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return is_staff_user(request.user)


class IsProviderOwnerOrStaffOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if is_staff_user(request.user):
            return True

        owner = getattr(obj, "owner", None)
        if owner is None and hasattr(obj, "provider"):
            owner = obj.provider.owner
        if owner is None and hasattr(obj, "service"):
            owner = obj.service.provider.owner

        return bool(request.user and request.user.is_authenticated and owner == request.user)
