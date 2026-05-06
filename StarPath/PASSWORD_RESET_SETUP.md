# Password Reset Flow - Setup Guide

## Configuration

### Backend Setup

1. **Install Resend package:**
```bash
cd starpath-backend
pip install resend
```

2. **Set environment variable:**
Create or update `.env` file in `starpath-backend/` with:
```
RESEND_API_KEY=re_M4Wu27Yk_5me6eZziJSGXoqcfwn3Bot63
```

3. **Update database schema:**
Run migrations to add password reset token fields:
```bash
cd starpath-backend
alembic revision --autogenerate -m "Add password reset token fields to User model"
alembic upgrade head
```

### API Endpoints

**POST /api/v1/auth/forgot-password**
- Query parameter: `email=user@example.com`
- Returns: `{"message": "If that email exists, a reset link will be sent"}`
- Sends email with reset link to user

**POST /api/v1/auth/reset-password**
- Query parameters:
  - `token=<reset_token_from_email>`
  - `new_password=<new_password>`
- Returns: `{"message": "Password reset successfully"}`
- Updates user's password and clears reset token

## Frontend Pages

### Forgot Password Page
- **Route:** `/auth/forgot-password`
- **Features:**
  - Email input field
  - Success confirmation message
  - Error handling
  - Link back to login

### Reset Password Page
- **Route:** `/auth/reset-password?token=<token>`
- **Features:**
  - New password input with visibility toggle
  - Confirm password field
  - Password validation (min 6 characters)
  - Token expiration check
  - Auto-redirect to login on success

### Login Page Enhancement
- Added "Forgot password?" link below password field
- Links to forgot-password page

## Email Template

Sends HTML email with:
- Reset link with 1-hour expiration
- Copy-paste URL as fallback
- Security notice

## Security Features

✅ Reset tokens expire after 1 hour
✅ Tokens are single-use (cleared after password reset)
✅ Email doesn't reveal if user exists (security best practice)
✅ Password validation (minimum 6 characters)
✅ Passwords hashed with bcrypt
✅ Token generated using secure random 32-byte string

## Testing

1. **Forgot Password Flow:**
   - Visit `http://localhost:3000/auth/forgot-password`
   - Enter registered email
   - Check for email (in development, check terminal/Resend dashboard)

2. **Reset Password Flow:**
   - Click reset link in email
   - Enter new password
   - Confirm with same password
   - Redirects to login
   - Login with new password

## Troubleshooting

If email not sending:
- Verify RESEND_API_KEY is set correctly
- Check Resend dashboard for API key validity
- Verify backend is running on http://localhost:8001
- Check browser console for API errors

If token expires:
- Reset tokens expire after 1 hour
- User must request new reset link from forgot-password page
