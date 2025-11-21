from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings


def send_registration_notification(user_email, user_name, admin_email='info@myinvoiceonline.net'):
    """Send email to admin about new registration"""
    subject = f"New User Registration: {user_name}"
    html_message = f"""
    <h2>New User Registration</h2>
    <p>A new user has registered and is awaiting approval:</p>
    <ul>
        <li><strong>Email:</strong> {user_email}</li>
        <li><strong>Name:</strong> {user_name}</li>
        <li><strong>Date:</strong> {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</li>
    </ul>
    <p>Please log in to the admin panel to approve or reject this registration.</p>
    """
    
    try:
        send_mail(
            subject,
            "New user registration pending approval",
            settings.DEFAULT_FROM_EMAIL,
            [admin_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send registration notification: {str(e)}")
        return False


def send_approval_email(user_email, user_name, temporary_password):
    """Send approval email with temporary password to user"""
    subject = "Your Registration Has Been Approved"
    html_message = f"""
    <h2>Welcome to CDD System!</h2>
    <p>Hello {user_name},</p>
    <p>Your registration has been approved. You can now log in to the system.</p>
    <h3>Login Details:</h3>
    <ul>
        <li><strong>Email:</strong> {user_email}</li>
        <li><strong>Temporary Password:</strong> {temporary_password}</li>
    </ul>
    <p><strong>Important:</strong> You will be required to change your password on your first login for security purposes.</p>
    <p>
        <a href="{settings.ALLOWED_HOSTS[0]}/login" 
           style="display: inline-block; padding: 10px 20px; background-color: #0F2027; color: white; text-decoration: none; border-radius: 5px;">
            Log In Now
        </a>
    </p>
    <p>If you did not request this account, please contact our support team.</p>
    <hr>
    <p><em>CDD System Support Team</em></p>
    """
    
    try:
        send_mail(
            subject,
            "Your account has been approved. Please log in with the temporary password.",
            settings.DEFAULT_FROM_EMAIL,
            [user_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send approval email: {str(e)}")
        return False


def send_rejection_email(user_email, user_name, rejection_reason=''):
    """Send rejection email to user"""
    subject = "Registration Status Update"
    html_message = f"""
    <h2>Registration Decision</h2>
    <p>Hello {user_name},</p>
    <p>Unfortunately, your registration request has been rejected.</p>
    """
    
    if rejection_reason:
        html_message += f"<p><strong>Reason:</strong> {rejection_reason}</p>"
    
    html_message += """
    <p>Please contact our support team if you have any questions.</p>
    <hr>
    <p><em>CDD System Support Team</em></p>
    """
    
    try:
        send_mail(
            subject,
            "Your registration request has been reviewed.",
            settings.DEFAULT_FROM_EMAIL,
            [user_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send rejection email: {str(e)}")
        return False
