from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.facility import Facility as FacilityModel
from app.schemas.facility import Facility, FacilityCreate, FacilityUpdate
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[Facility])
def read_facilities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    facilities = db.query(FacilityModel).offset(skip).limit(limit).all()
    return facilities

@router.post("/", response_model=Facility)
def create_facility(facility: FacilityCreate, db: Session = Depends(get_db)):
    db_facility = FacilityModel(**facility.dict())
    db.add(db_facility)
    db.commit()
    db.refresh(db_facility)
    return db_facility

@router.get("/{facility_id}", response_model=Facility)
def read_facility(facility_id: UUID, db: Session = Depends(get_db)):
    db_facility = db.query(FacilityModel).filter(FacilityModel.id == facility_id).first()
    if db_facility is None:
        raise HTTPException(status_code=404, detail="Facility not found")
    return db_facility
