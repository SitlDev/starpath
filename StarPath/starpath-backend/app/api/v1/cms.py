"""
CMS Integration Endpoints
Handles CMS data submission, export, validation, and tracking
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User as UserModel, UserRole
from app.models.facility import Facility
from app.models.star_rating import StarRating
from app.models.health_inspection import HealthInspection
from app.models.cms_submission import CMSSubmission, SubmissionStatus
from app.api.v1.auth import get_current_user
from app.utils.rbac import require_admin, get_user_permissions
from app.utils.rate_limiting import cms_export_limiter, cms_submission_limiter, create_rate_limit_headers
from app.services.cms_export_service import CMSExportService, ExportFormat
from app.services.cms_validator import CMSValidator
from app.config import settings
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel
import uuid

router = APIRouter()

# ============= Pydantic Models =============

class ExportRequest(BaseModel):
    """Request to export facility data"""
    format: str = "json"  # "json" or "xml"

class ValidationRequest(BaseModel):
    """Request to validate facility data"""
    facility_id: str

class SubmissionRequest(BaseModel):
    """Request to submit facility data to CMS"""
    facility_id: str
    submission_type: str = "facility_data"  # facility_data, ratings, inspections, batch
    include_inspection_history: bool = True
    years_of_data: int = 3

class BulkSubmissionRequest(BaseModel):
    """Request for bulk CMS submission"""
    facility_ids: List[str]
    submission_type: str = "batch"
    comment: Optional[str] = None

class SubmissionResponse(BaseModel):
    """Response from CMS submission"""
    submission_id: str
    status: str
    facility_id: str
    facility_name: str
    cms_provider_id: str
    submission_date: datetime
    validation_result: Dict[str, Any]
    errors: List[Dict[str, str]] = []
    warnings: List[Dict[str, str]] = []

class SubmissionStatusResponse(BaseModel):
    """Current status of a submission"""
    submission_id: str
    status: str
    facility_name: str
    cms_provider_id: str
    submission_date: datetime
    validation_passed: bool
    cms_response_date: Optional[datetime] = None
    cms_confirmation_id: Optional[str] = None
    retry_count: int = 0
    errors: List[Dict[str, str]] = []

# ============= Export Endpoints =============

@router.post("/export/{facility_id}")
async def export_facility_data(
    facility_id: str,
    request: ExportRequest = Body(...),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
    response: Response = Response()
):
    """
    Export facility data in CMS format (JSON or XML)
    
    Permission: download_reports
    Rate limit: 100 per hour per user
    """
    # Check rate limiting
    if not cms_export_limiter.is_allowed(current_user.id, settings.RATE_LIMIT_CMS_EXPORTS):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded for CMS exports. Maximum 100 per hour."
        )
    
    # Add rate limit headers
    headers = create_rate_limit_headers(cms_export_limiter, current_user.id, settings.RATE_LIMIT_CMS_EXPORTS)
    for key, value in headers.items():
        response.headers[key] = value
    
    # Check permissions
    permissions = get_user_permissions(current_user)
    if not permissions.get("download_reports"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to export reports"
        )
    
    # Get facility
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found"
        )
    
    # Get ratings and inspections
    ratings = db.query(StarRating).filter(
        StarRating.facility_id == facility_id
    ).order_by(StarRating.effective_date.desc()).limit(24).all()
    
    inspections = db.query(HealthInspection).filter(
        HealthInspection.facility_id == facility_id
    ).order_by(HealthInspection.inspection_date.desc()).limit(30).all()
    
    # Format data for export
    facility_data = {
        'cms_provider_id': facility.cms_provider_id,
        'name': facility.name,
        'address': facility.address,
        'city': facility.city,
        'state': facility.state,
        'zip_code': facility.zip_code,
        'bed_count': facility.bed_count,
        'ownership': facility.ownership,
        'is_active': facility.is_active
    }
    
    ratings_data = [
        {
            'effective_date': r.effective_date,
            'overall_rating': r.overall_rating,
            'health_inspection_rating': r.health_inspection_rating,
            'staffing_rating': r.staffing_rating,
            'qm_rating': r.qm_rating
        }
        for r in ratings
    ]
    
    inspections_data = [
        {
            'inspection_date': i.inspection_date,
            'inspection_type': i.inspection_type,
            'status': i.status,
            'deficiencies': []  # TODO: Include actual deficiencies from related model
        }
        for i in inspections
    ]
    
    # Generate export
    export_service = CMSExportService()
    export_format = ExportFormat.XML if request.format.upper() == "XML" else ExportFormat.JSON
    
    try:
        exported_data = export_service.export_facility_data(
            facility_data,
            ratings_data,
            inspections_data,
            export_format
        )
        
        return {
            "facility_id": facility_id,
            "facility_name": facility.name,
            "cms_provider_id": facility.cms_provider_id,
            "format": request.format,
            "export_date": datetime.now(timezone.utc).isoformat(),
            "data": exported_data,
            "record_count": {
                "ratings": len(ratings_data),
                "inspections": len(inspections_data)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )

# ============= Validation Endpoints =============

@router.post("/validate/{facility_id}")
async def validate_facility_data(
    facility_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Validate facility data against CMS requirements
    
    Returns validation errors and warnings
    """
    # Get facility
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found"
        )
    
    # Get ratings and inspections
    ratings = db.query(StarRating).filter(
        StarRating.facility_id == facility_id
    ).order_by(StarRating.effective_date.desc()).all()
    
    inspections = db.query(HealthInspection).filter(
        HealthInspection.facility_id == facility_id
    ).order_by(HealthInspection.inspection_date.desc()).all()
    
    # Format data
    facility_data = {
        'cms_provider_id': facility.cms_provider_id,
        'name': facility.name,
        'address': facility.address,
        'city': facility.city,
        'state': facility.state,
        'zip_code': facility.zip_code,
        'bed_count': facility.bed_count,
        'ownership': facility.ownership,
        'is_active': facility.is_active
    }
    
    ratings_data = [
        {
            'effective_date': r.effective_date,
            'overall_rating': r.overall_rating,
            'health_inspection_rating': r.health_inspection_rating,
            'staffing_rating': r.staffing_rating,
            'qm_rating': r.qm_rating
        }
        for r in ratings
    ]
    
    inspections_data = [
        {
            'inspection_date': i.inspection_date,
            'inspection_type': i.inspection_type,
            'status': i.status,
            'deficiencies': []
        }
        for i in inspections
    ]
    
    # Validate
    validator = CMSValidator()
    is_valid, errors, warnings = validator.validate_facility_data(
        facility_data,
        ratings_data,
        inspections_data
    )
    
    return {
        "facility_id": facility_id,
        "facility_name": facility.name,
        "cms_provider_id": facility.cms_provider_id,
        "validation_date": datetime.now(timezone.utc).isoformat(),
        "is_valid": is_valid,
        "total_errors": len(errors),
        "total_warnings": len(warnings),
        "errors": errors,
        "warnings": warnings,
        "can_submit": is_valid
    }

# ============= Submission Endpoints =============

@router.post("/submit/{facility_id}", response_model=SubmissionResponse)
async def submit_facility_to_cms(
    facility_id: str,
    request: SubmissionRequest = Body(...),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
    response: Response = Response()
):
    """
    Submit facility data to CMS
    
    1. Validates data against CMS requirements
    2. Creates submission record
    3. Returns submission ID for tracking
    
    Permission: edit_facilities
    Rate limit: 50 per hour per user
    """
    # Check rate limiting
    if not cms_submission_limiter.is_allowed(current_user.id, settings.RATE_LIMIT_CMS_SUBMISSIONS):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded for CMS submissions. Maximum 50 per hour."
        )
    
    # Add rate limit headers
    headers = create_rate_limit_headers(cms_submission_limiter, current_user.id, settings.RATE_LIMIT_CMS_SUBMISSIONS)
    for key, value in headers.items():
        response.headers[key] = value
    
    # Check permissions
    permissions = get_user_permissions(current_user)
    if not permissions.get("edit_facilities"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to submit facility data to CMS"
        )
    
    # Get facility
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found"
        )
    
    # Get ratings and inspections
    ratings = db.query(StarRating).filter(
        StarRating.facility_id == facility_id
    ).order_by(StarRating.effective_date.desc()).all()
    
    inspections = db.query(HealthInspection).filter(
        HealthInspection.facility_id == facility_id
    ).order_by(HealthInspection.inspection_date.desc()).all()
    
    # Format data
    facility_data = {
        'cms_provider_id': facility.cms_provider_id,
        'name': facility.name,
        'address': facility.address,
        'city': facility.city,
        'state': facility.state,
        'zip_code': facility.zip_code,
        'bed_count': facility.bed_count,
        'ownership': facility.ownership,
        'is_active': facility.is_active
    }
    
    ratings_data = [
        {
            'effective_date': r.effective_date,
            'overall_rating': r.overall_rating,
            'health_inspection_rating': r.health_inspection_rating,
            'staffing_rating': r.staffing_rating,
            'qm_rating': r.qm_rating
        }
        for r in ratings
    ]
    
    inspections_data = [
        {
            'inspection_date': i.inspection_date,
            'inspection_type': i.inspection_type,
            'status': i.status,
            'deficiencies': []
        }
        for i in inspections
    ]
    
    # Validate data
    validator = CMSValidator()
    is_valid, errors, warnings = validator.validate_facility_data(
        facility_data,
        ratings_data,
        inspections_data
    )
    
    # Create submission record (even if validation fails)
    submission_id = str(uuid.uuid4())
    
    # Export data
    export_service = CMSExportService()
    try:
        exported_json = export_service.export_facility_data(
            facility_data,
            ratings_data,
            inspections_data,
            ExportFormat.JSON
        )
    except Exception as e:
        exported_json = None
    
    # Create database record
    submission = CMSSubmission(
        id=submission_id,
        facility_id=facility_id,
        facility_name=facility.name,
        cms_provider_id=facility.cms_provider_id,
        submission_type=request.submission_type,
        status=SubmissionStatus.ACCEPTED if is_valid else SubmissionStatus.VALIDATION_ERROR,
        data_format="json",
        data_version="1.0",
        submission_data=exported_json,
        validation_passed=is_valid,
        validation_errors={"errors": errors, "warnings": warnings} if errors or warnings else None,
        submitted_by=current_user.email,
        record_count=len(ratings_data) + len(inspections_data)
    )
    
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    return SubmissionResponse(
        submission_id=submission_id,
        status=submission.status,
        facility_id=facility_id,
        facility_name=facility.name,
        cms_provider_id=facility.cms_provider_id,
        submission_date=submission.submission_date,
        validation_result={
            "is_valid": is_valid,
            "total_errors": len(errors),
            "total_warnings": len(warnings),
            "can_submit": is_valid
        },
        errors=errors,
        warnings=warnings
    )

@router.post("/submit/bulk")
async def bulk_submit_to_cms(
    request: BulkSubmissionRequest = Body(...),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit multiple facilities to CMS in one batch
    
    Permission: edit_facilities + admin
    """
    # Check permissions
    permissions = get_user_permissions(current_user)
    if not permissions.get("edit_facilities") or current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can perform bulk submissions"
        )
    
    batch_id = str(uuid.uuid4())
    submissions = []
    
    for facility_id in request.facility_ids:
        # Get facility
        facility = db.query(Facility).filter(Facility.id == facility_id).first()
        if not facility:
            continue
        
        # Get data and create submission (simplified)
        submission = CMSSubmission(
            id=str(uuid.uuid4()),
            facility_id=facility_id,
            facility_name=facility.name,
            cms_provider_id=facility.cms_provider_id,
            submission_type=request.submission_type,
            status=SubmissionStatus.PENDING,
            data_format="json",
            data_version="1.0",
            submitted_by=current_user.email,
            submission_batch_id=batch_id,
            notes=request.comment
        )
        
        db.add(submission)
        submissions.append(submission)
    
    db.commit()
    
    return {
        "batch_id": batch_id,
        "submission_count": len(submissions),
        "status": "batch_created",
        "submissions": [
            {
                "submission_id": s.id,
                "facility_name": s.facility_name,
                "cms_provider_id": s.cms_provider_id,
                "status": s.status
            }
            for s in submissions
        ]
    }

# ============= Submission Tracking Endpoints =============

@router.get("/submissions")
async def list_submissions(
    facility_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all CMS submissions with optional filters"""
    
    query = db.query(CMSSubmission).order_by(CMSSubmission.submission_date.desc())
    
    # Filter by facility if provided
    if facility_id:
        query = query.filter(CMSSubmission.facility_id == facility_id)
    
    # Filter by status if provided
    if status:
        query = query.filter(CMSSubmission.status == status)
    
    submissions = query.limit(limit).all()
    
    return {
        "count": len(submissions),
        "submissions": [
            {
                "submission_id": s.id,
                "facility_id": s.facility_id,
                "facility_name": s.facility_name,
                "cms_provider_id": s.cms_provider_id,
                "submission_date": s.submission_date,
                "submission_type": s.submission_type,
                "status": s.status,
                "validation_passed": s.validation_passed,
                "cms_confirmation_id": s.cms_confirmation_id,
                "submitted_by": s.submitted_by
            }
            for s in submissions
        ]
    }

@router.get("/submissions/{submission_id}", response_model=SubmissionStatusResponse)
async def get_submission_status(
    submission_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get status of a specific CMS submission"""
    
    submission = db.query(CMSSubmission).filter(CMSSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    errors = []
    if submission.validation_errors:
        errors = submission.validation_errors.get('errors', [])
    
    return SubmissionStatusResponse(
        submission_id=submission.id,
        status=submission.status,
        facility_name=submission.facility_name,
        cms_provider_id=submission.cms_provider_id,
        submission_date=submission.submission_date,
        validation_passed=submission.validation_passed,
        cms_response_date=submission.cms_response_date,
        cms_confirmation_id=submission.cms_confirmation_id,
        retry_count=submission.retry_count,
        errors=errors
    )

@router.post("/submissions/{submission_id}/retry")
async def retry_submission(
    submission_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retry a failed CMS submission"""
    
    submission = db.query(CMSSubmission).filter(CMSSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Can only retry failed submissions
    if submission.status not in [SubmissionStatus.FAILED, SubmissionStatus.REJECTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot retry submission with status: {submission.status}"
        )
    
    # Update submission
    submission.status = SubmissionStatus.PENDING
    submission.retry_count += 1
    submission.last_retry_date = datetime.now(timezone.utc)
    
    db.commit()
    
    return {
        "submission_id": submission_id,
        "status": submission.status,
        "retry_count": submission.retry_count,
        "message": "Submission queued for retry"
    }
