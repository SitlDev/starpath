from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.overall_rating_service import OverallRatingService
from app.schemas.star_rating import StarRating, StarRatingCreate
from app.schemas.health_inspection import HealthInspection as HealthInspectionSchema
from app.models.star_rating import StarRating as StarRatingModel
from app.models.health_inspection import HealthInspection as HealthInspectionModel
from app.models.facility import Facility
from uuid import UUID
from datetime import date
from typing import List

router = APIRouter()

@router.post("/calculate/{facility_id}", response_model=StarRating)
def calculate_facility_rating(
    facility_id: UUID,
    effective_date: date,
    db: Session = Depends(get_db)
):
    service = OverallRatingService(db)
    rating = service.calculate_overall_rating(facility_id, effective_date)
    if not rating:
        raise HTTPException(status_code=404, detail="Facility data not found or insufficient for calculation")
    return rating

@router.get("/facility/{facility_id}", response_model=List[StarRating])
def get_facility_ratings(
    facility_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all star ratings for a facility, ordered by most recent first."""
    # Verify facility exists
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    
    ratings = db.query(StarRatingModel).filter(
        StarRatingModel.facility_id == facility_id
    ).order_by(StarRatingModel.effective_date.desc()).all()
    
    return ratings

@router.get("/facility/{facility_id}/latest", response_model=StarRating)
def get_latest_facility_rating(
    facility_id: UUID,
    db: Session = Depends(get_db)
):
    """Get the latest star rating for a facility."""
    # Verify facility exists
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    
    rating = db.query(StarRatingModel).filter(
        StarRatingModel.facility_id == facility_id
    ).order_by(StarRatingModel.effective_date.desc()).first()
    
    if not rating:
        raise HTTPException(status_code=404, detail="No ratings found for this facility")
    
    return rating

