from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError
from rest_framework import serializers
from rest_framework.authtoken.models import Token

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="get_full_name", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "role",
            "country",
            "avatar_url",
            "is_verified",
            "created_at",
        ]
        read_only_fields = ["id", "role", "is_verified", "created_at"]


class AuthResponseSerializer(serializers.Serializer):
    token = serializers.CharField()
    user = UserSerializer()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "phone", "country"]

    def validate_email(self, value):
        return value.strip().lower()

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        email = validated_data["email"]
        username_base = email.split("@", 1)[0] or "customer"
        username = username_base
        suffix = 1
        while User.objects.filter(username=username).exists():
            suffix += 1
            username = f"{username_base}{suffix}"

        try:
            user = User.objects.create_user(username=username, role=User.Role.CUSTOMER, **validated_data)
        except IntegrityError as exc:
            raise serializers.ValidationError({"email": "A user with this email already exists."}) from exc
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        password = attrs["password"]
        user = User.objects.filter(email=email).first()
        if user is None:
            raise serializers.ValidationError("Invalid email or password.")

        authenticated_user = authenticate(
            request=self.context.get("request"),
            username=user.username,
            password=password,
        )
        if authenticated_user is None:
            raise serializers.ValidationError("Invalid email or password.")
        if not authenticated_user.is_active:
            raise serializers.ValidationError("This account is disabled.")

        attrs["user"] = authenticated_user
        return attrs


def auth_payload(user):
    token, _created = Token.objects.get_or_create(user=user)
    return {"token": token.key, "user": UserSerializer(user).data}
