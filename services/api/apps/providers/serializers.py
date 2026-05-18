from django.utils.text import slugify
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.categories.serializers import CategorySerializer

from .models import ProviderProfile


class ProviderProfileSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    category_detail = CategorySerializer(source="category", read_only=True)
    slug = serializers.SlugField(required=False)

    class Meta:
        model = ProviderProfile
        fields = [
            "id",
            "owner",
            "category",
            "category_detail",
            "business_name",
            "slug",
            "description",
            "verification_status",
            "rating_average",
            "rating_count",
            "address",
            "city",
            "country",
            "latitude",
            "longitude",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "owner",
            "verification_status",
            "rating_average",
            "rating_count",
            "created_at",
            "updated_at",
        ]

    def validate_slug(self, value):
        return slugify(value)

    def validate(self, attrs):
        if not attrs.get("slug") and attrs.get("business_name"):
            attrs["slug"] = slugify(attrs["business_name"])
        slug = attrs.get("slug")
        if slug:
            queryset = ProviderProfile.objects.filter(slug=slug)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError({"slug": "A provider with this slug already exists."})
        return attrs

    def create(self, validated_data):
        owner = self.context["request"].user
        owner.role = owner.Role.PROVIDER
        owner.save(update_fields=["role", "updated_at"])
        return ProviderProfile.objects.create(owner=owner, **validated_data)
