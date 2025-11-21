from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, UserApproval
from .email_utils import send_registration_notification
import string
import random

class UserRegistrationSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    phone_number = serializers.CharField(required=False, max_length=20, allow_blank=True)
    
    class Meta:
        model = CustomUser
        fields = ('email', 'first_name', 'last_name', 'phone_number', 'password', 'password_confirm', 'role')
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'required': False}
        }

    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError({"password": "Passwords must match."})
        
        if len(data['password']) < 8:
            raise serializers.ValidationError({"password": "Password must be at least 8 characters."})
        
        if CustomUser.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already registered."})
        
        return data

    def create(self, validated_data):
        # Create user but not active yet
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data.get('phone_number', ''),
            username=validated_data['email'],
            password=validated_data['password'],
            is_active=False,
            is_approved=False,
            role=validated_data.get('role', 'user')
        )
        
        # Create approval record
        UserApproval.objects.create(user=user)
        
        # Send notification to admin
        user_name = f"{user.first_name} {user.last_name}"
        send_registration_notification(user.email, user_name)
        
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'role', 'distribution_channel', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user


class UserApprovalSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)
    
    class Meta:
        model = UserApproval
        fields = ('id', 'user', 'user_email', 'user_name', 'user_phone', 'status', 'requested_at', 'approved_at', 'rejection_reason')
        read_only_fields = ('id', 'requested_at', 'approved_at')
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


class ApproveUserSerializer(serializers.Serializer):
    """Serializer for approving a user"""
    user_id = serializers.IntegerField()
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)


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

            if not user.is_active or not user.is_approved or not user.check_password(password):
                raise AuthenticationFailed("No active account found with the given credentials.")

            self.user = user
            refresh = self.get_token(user)
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'must_change_password': user.must_change_password,
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
        token['distribution_channel'] = getattr(user, 'distribution_channel', None)
        token['must_change_password'] = user.must_change_password
        return token