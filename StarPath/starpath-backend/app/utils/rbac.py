from fastapi import HTTPException, status, Depends
from app.models.user import User as UserModel, UserRole
from app.api.v1.auth import get_current_user
from typing import List

def require_role(*required_roles: UserRole):
    """Dependency to require specific role(s)"""
    async def check_role(current_user: UserModel = Depends(get_current_user)) -> UserModel:
        if current_user.role not in required_roles and not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of these roles: {', '.join([r.value for r in required_roles])}"
            )
        return current_user
    return check_role

def require_admin(current_user: UserModel = Depends(get_current_user)) -> UserModel:
    """Require admin role"""
    if current_user.role != UserRole.ADMIN and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_facility_manager(current_user: UserModel = Depends(get_current_user)) -> UserModel:
    """Require facility manager or admin role"""
    if current_user.role not in [UserRole.FACILITY_MANAGER, UserRole.ADMIN] and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Facility manager access required"
        )
    return current_user

def get_user_permissions(user: UserModel) -> dict:
    """Get feature permissions based on user role"""
    permissions = {
        "view_dashboard": True,
        "view_facilities": True,
        "view_ratings": True,
        "view_inspections": True,
        "download_reports": True,
        "export_data": False,
    }
    
    if user.role == UserRole.AUDITOR:
        permissions.update({
            "view_dashboard": True,
            "view_facilities": True,
            "view_ratings": True,
            "view_inspections": True,
            "download_reports": True,
            "export_data": False,
        })
    
    elif user.role == UserRole.FACILITY_MANAGER:
        permissions.update({
            "view_dashboard": True,
            "view_facilities": True,
            "edit_facilities": True,
            "view_ratings": True,
            "edit_ratings": True,
            "view_inspections": True,
            "create_inspections": True,
            "download_reports": True,
            "export_data": True,
        })
    
    elif user.role == UserRole.ADMIN:
        permissions.update({
            "view_dashboard": True,
            "view_facilities": True,
            "edit_facilities": True,
            "delete_facilities": True,
            "view_ratings": True,
            "edit_ratings": True,
            "view_inspections": True,
            "create_inspections": True,
            "download_reports": True,
            "export_data": True,
            "manage_users": True,
            "manage_roles": True,
        })
    
    return permissions
