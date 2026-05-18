from rest_framework import serializers

from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    parent_slug = serializers.SlugRelatedField(source="parent", slug_field="slug", read_only=True)

    class Meta:
        model = Category
        fields = [
            "id",
            "parent",
            "parent_slug",
            "name",
            "slug",
            "icon",
            "active",
            "sort_order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
