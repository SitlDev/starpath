from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any

class FacilityBase(BaseModel):
    cms_provider_id: str
    name: str
    address: Dict[str, Any]
    ownership: Optional[str] = None
    bed_count: Optional[int] = None
    is_active: bool = True

class FacilityCreate(FacilityBase):
    pass

class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    ownership: Optional[str] = None
    bed_count: Optional[int] = None
    is_active: Optional[bool] = None

class Facility(FacilityBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
