from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'role', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Accept email in addition to username and make username optional
        self.fields['email'] = serializers.EmailField(required=False)
        self.fields[self.username_field].required = False

    def validate(self, attrs):
        email = attrs.get('email')
        username = attrs.get('username')
        password = attrs.get('password')

        # If email is provided, authenticate via email
        if email:
            if not password:
                raise AuthenticationFailed("Email and password are required.")

            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                raise AuthenticationFailed("No active account found with the given credentials.")

            if not user.is_active or not user.check_password(password):
                raise AuthenticationFailed("No active account found with the given credentials.")

            self.user = user
            refresh = self.get_token(user)
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }

        # Fallback to default username-based validation
        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        token['name'] = user.get_full_name() or user.username
        token['role'] = getattr(user, 'role', 'user')
        return token