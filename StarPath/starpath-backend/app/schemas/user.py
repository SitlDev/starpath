from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    FACILITY_MANAGER = "facility_manager"
    AUDITOR = "auditor"

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[UserRole] = UserRole.FACILITY_MANAGER
    is_active: Optional[bool] = True
    is_superuser: bool = False

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None

class UserPermissions(BaseModel):
    view_dashboard: bool
    view_facilities: bool
    edit_facilities: bool = False
    delete_facilities: bool = False
    view_ratings: bool
    edit_ratings: bool = False
    view_inspections: bool
    create_inspections: bool = False
    download_reports: bool
    export_data: bool = False
    manage_users: bool = False
    manage_roles: bool = False

class User(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
