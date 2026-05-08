from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User as UserModel
from app.schemas.user import User, UserCreate, Token
from app.utils.security import verify_password, get_password_hash, create_access_token, decode_token
from datetime import timedelta, datetime, timezone
import secrets
import os

try:
    from resend import Resend
    RESEND_AVAILABLE = True
except ImportError:
    RESEND_AVAILABLE = False

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserModel:
    """Get the current authenticated user from JWT token"""
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    email = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

@router.post("/register", response_model=User)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(UserModel).filter(UserModel.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = UserModel(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate user and return JWT token"""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"🔐 LOGIN REQUEST STARTED for username: {form_data.username}")
    
    try:
        # Find user by email (form_data.username contains the email)
        logger.info(f"  → Querying database for user with email: {form_data.username}")
        user = db.query(UserModel).filter(UserModel.email == form_data.username).first()
        logger.info(f"  → Database query completed. User found: {user is not None}")
        
        if not user:
            logger.warning(f"  ✗ User not found for email: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.info(f"  → Found user: {user.email} (ID: {user.id})")
        logger.info(f"  → Hashed password type: {type(user.hashed_password)}")
        logger.info(f"  → Hashed password length: {len(user.hashed_password) if user.hashed_password else 'None'}")
        
        # DEBUG: Try password verification with timeout
        logger.info(f"  → Starting password verification...")
        import bcrypt
        plain_pwd_bytes = form_data.password.encode()
        hashed_pwd_bytes = user.hashed_password.encode() if isinstance(user.hashed_password, str) else user.hashed_password
        
        logger.info(f"  → Plain password bytes length: {len(plain_pwd_bytes)}")
        logger.info(f"  → Hashed password bytes type: {type(hashed_pwd_bytes)}")
        logger.info(f"  → Hashed password bytes length: {len(hashed_pwd_bytes)}")
        
        password_valid = bcrypt.checkpw(plain_pwd_bytes, hashed_pwd_bytes)
        logger.info(f"  ✓ Password verification completed. Valid: {password_valid}")
        
        if not password_valid:
            logger.warning(f"  ✗ Invalid password for user: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            logger.warning(f"  ✗ User account is inactive: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Create access token
        logger.info(f"  → Creating JWT access token...")
        access_token = create_access_token(data={"sub": user.email, "user_id": str(user.id)})
        logger.info(f"  ✓ Access token created. Length: {len(access_token)}")
        
        logger.info(f"✅ LOGIN SUCCESSFUL for user: {form_data.username}")
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ UNEXPECTED ERROR during login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )

@router.get("/me", response_model=User)
def get_current_user_info(current_user: UserModel = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user

@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    """Send password reset email"""
    # Find user by email
    user = db.query(UserModel).filter(UserModel.email == email).first()
    
    if not user:
        # Don't reveal if user exists (security best practice)
        return {"message": "If that email exists, a reset link will be sent"}
    
    if not RESEND_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service not configured"
        )
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Store token in user record
    user.password_reset_token = reset_token
    user.password_reset_token_expires = token_expires
    db.commit()
    
    # Send email via Resend
    try:
        resend_api_key = os.getenv("RESEND_API_KEY")
        if not resend_api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Resend API key not configured"
            )
        
        client = Resend(api_key=resend_api_key)
        reset_url = f"http://localhost:3000/auth/reset-password?token={reset_token}"
        
        client.emails.send({
            "from": "noreply@starpath.app",
            "to": email,
            "subject": "Reset Your StarPath Password",
            "html": f"""
            <h2>Password Reset Request</h2>
            <p>Click the link below to reset your password. This link expires in 1 hour.</p>
            <p><a href="{reset_url}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
            <p>Or copy this link: {reset_url}</p>
            <p>If you didn't request this, ignore this email.</p>
            """
        })
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send reset email"
        )
    
    return {"message": "If that email exists, a reset link will be sent"}

@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    """Reset password with token"""
    if not token or not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token and new password are required"
        )
    
    if len(new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters"
        )
    
    # Find user by reset token
    user = db.query(UserModel).filter(UserModel.password_reset_token == token).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )
    
    # Check if token has expired
    if user.password_reset_token_expires is None or datetime.now(timezone.utc) > user.password_reset_token_expires:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    # Update password
    user.hashed_password = get_password_hash(new_password)
    user.password_reset_token = None
    user.password_reset_token_expires = None
    db.commit()
    
    return {"message": "Password reset successfully"}
