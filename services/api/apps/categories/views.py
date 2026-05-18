from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from apps.permissions import IsStaffOrReadOnly

from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsStaffOrReadOnly]
    filterset_fields = ["active", "parent"]
    search_fields = ["name", "slug"]
    ordering_fields = ["sort_order", "name", "created_at"]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            queryset = queryset.filter(active=True)
        return queryset
