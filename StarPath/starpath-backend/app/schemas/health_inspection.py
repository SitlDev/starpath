from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date, datetime
from typing import List, Optional, Dict
from enum import Enum

class SurveyType(str, Enum):
    STANDARD = "standard"
    COMPLAINT = "complaint"
    INFECTION_CONTROL = "infection_control"
    REVISIT = "revisit"

class DeficiencyBase(BaseModel):
    f_tag: str
    scope: str
    severity: str
    description: Optional[str] = None
    is_substandard_qoc: bool = False
    is_immediate_jeopardy: bool = False
    is_past_non_compliance: bool = False

class DeficiencyCreate(DeficiencyBase):
    pass

class Deficiency(DeficiencyBase):
    id: UUID
    health_inspection_id: UUID
    points: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class HealthInspectionBase(BaseModel):
    survey_date: date
    survey_type: SurveyType
    cycle: Optional[int] = None
    revisit_count: int = 0

class HealthInspectionCreate(HealthInspectionBase):
    facility_id: UUID

class HealthInspection(HealthInspectionBase):
    id: UUID
    facility_id: UUID
    deficiencies: List[Deficiency] = []
    created_at: datetime

    class Config:
        from_attributes = True
