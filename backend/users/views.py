from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
import string
import random

from .serializers import (
    UserRegistrationSerializer,
    UserSerializer, 
    CustomTokenObtainPairSerializer,
    UserApprovalSerializer,
    ApproveUserSerializer
)
from .models import CustomUser, UserApproval
from .email_utils import send_approval_email, send_rejection_email
from rest_framework_simplejwt.views import TokenObtainPairView


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            'message': 'Registration successful. Please wait for admin approval.',
            'email': serializer.data.get('email')
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserApprovalViewSet(viewsets.ReadOnlyModelViewSet):
    """View pending user registrations (admin only)"""
    queryset = UserApproval.objects.all()
    serializer_class = UserApprovalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only superusers/admins can see approvals
        if self.request.user.is_superuser or self.request.user.role == 'admin':
            return UserApproval.objects.all()
        return UserApproval.objects.none()
    
    @action(detail=False, methods=['post'])
    def approve_user(self, request):
        """Approve a pending user registration"""
        if not (request.user.is_superuser or request.user.role == 'admin'):
            return Response(
                {'detail': 'Only admins can approve users'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ApproveUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_id = serializer.validated_data['user_id']
        action_type = serializer.validated_data['action']
        rejection_reason = serializer.validated_data.get('rejection_reason', '')
        
        try:
            user = CustomUser.objects.get(id=user_id)
            approval = UserApproval.objects.get(user=user)
        except (CustomUser.DoesNotExist, UserApproval.DoesNotExist):
            return Response(
                {'detail': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if action_type == 'approve':
            # Generate temporary password
            temp_password = self.generate_temporary_password()
            
            # Update user
            user.is_active = True
            user.is_approved = True
            user.must_change_password = True
            user.set_password(temp_password)
            user.save()
            
            # Update approval record
            approval.status = 'approved'
            approval.temporary_password = temp_password
            approval.approved_at = timezone.now()
            approval.approved_by = request.user
            approval.save()
            
            # Send approval email with temporary password
            user_name = f"{user.first_name} {user.last_name}"
            send_approval_email(user.email, user_name, temp_password)
            
            return Response({
                'message': f'User {user.email} has been approved',
                'temporary_password': temp_password
            }, status=status.HTTP_200_OK)
        
        elif action_type == 'reject':
            # Update user
            user.is_active = False
            user.save()
            
            # Update approval record
            approval.status = 'rejected'
            approval.rejection_reason = rejection_reason
            approval.approved_at = timezone.now()
            approval.approved_by = request.user
            approval.save()
            
            # Send rejection email
            user_name = f"{user.first_name} {user.last_name}"
            send_rejection_email(user.email, user_name, rejection_reason)
            
            return Response({
                'message': f'User {user.email} has been rejected'
            }, status=status.HTTP_200_OK)
    
    @staticmethod
    def generate_temporary_password(length=12):
        """Generate a secure temporary password"""
        characters = string.ascii_letters + string.digits + '!@#$%^&*'
        # Ensure at least one uppercase, one lowercase, one digit, one special char
        password = [
            random.choice(string.ascii_uppercase),
            random.choice(string.ascii_lowercase),
            random.choice(string.digits),
            random.choice('!@#$%^&*'),
        ]
        # Fill the rest randomly
        password += random.choices(characters, k=length - 4)
        random.shuffle(password)
        return ''.join(password)


class ChangePasswordView(generics.GenericAPIView):
    """Change password (required on first login)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        new_password_confirm = request.data.get('new_password_confirm')
        
        # Validate old password
        if not user.check_password(old_password):
            return Response(
                {'old_password': 'Incorrect password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate new passwords match
        if new_password != new_password_confirm:
            return Response(
                {'new_password': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password length
        if len(new_password) < 8:
            return Response(
                {'new_password': 'Password must be at least 8 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update password
        user.set_password(new_password)
        user.must_change_password = False
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
