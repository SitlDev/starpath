from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime
from typing import Optional, Dict, Any
from decimal import Decimal

class StarRatingBase(BaseModel):
    facility_id: UUID
    effective_date: date
    health_inspection_rating: Optional[int] = None
    staffing_rating: Optional[int] = None
    qm_rating: Optional[int] = None
    overall_rating: Optional[int] = None
    health_inspection_score: Optional[Decimal] = None
    staffing_score: Optional[int] = None
    qm_score: Optional[int] = None
    calculation_details: Optional[Dict[str, Any]] = None

class StarRatingCreate(StarRatingBase):
    pass

class StarRating(StarRatingBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
