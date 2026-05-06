from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.health_inspection import HealthInspection
from app.models.health_inspection import HealthInspection as HealthInspectionModel
from app.models.facility import Facility
from uuid import UUID
from typing import List

router = APIRouter()

@router.get("/facility/{facility_id}", response_model=List[HealthInspection])
def get_facility_inspections(
    facility_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all health inspections for a facility, ordered by most recent first."""
    # Verify facility exists
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    
    inspections = db.query(HealthInspectionModel).filter(
        HealthInspectionModel.facility_id == facility_id
    ).order_by(HealthInspectionModel.survey_date.desc()).all()
    
    return inspections

@router.get("/facility/{facility_id}/latest", response_model=HealthInspection)
def get_latest_inspection(
    facility_id: UUID,
    db: Session = Depends(get_db)
):
    """Get the latest health inspection for a facility."""
    # Verify facility exists
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    
    inspection = db.query(HealthInspectionModel).filter(
        HealthInspectionModel.facility_id == facility_id
    ).order_by(HealthInspectionModel.survey_date.desc()).first()
    
    if not inspection:
        raise HTTPException(status_code=404, detail="No inspections found for this facility")
    
    return inspection
