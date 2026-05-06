from sqlalchemy.orm import Session
from app.models.health_inspection import HealthInspection
from app.models.deficiency import Deficiency
from app.calculators.health_inspection_calculator import HealthInspectionCalculator
from app.schemas.health_inspection import HealthInspectionCreate, DeficiencyCreate
from uuid import UUID
from datetime import datetime

class HealthInspectionService:
    def __init__(self, db: Session):
        self.db = db
        self.calculator = HealthInspectionCalculator()

    def create_inspection(self, inspection_in: HealthInspectionCreate) -> HealthInspection:
        db_inspection = HealthInspection(**inspection_in.dict())
        self.db.add(db_inspection)
        self.db.commit()
        self.db.refresh(db_inspection)
        return db_inspection

    def add_deficiency(self, inspection_id: UUID, deficiency_in: DeficiencyCreate) -> Deficiency:
        db_deficiency = Deficiency(
            health_inspection_id=inspection_id,
            **deficiency_in.dict()
        )
        # Calculate points before saving
        db_deficiency.points = self.calculator.calculate_deficiency_points(db_deficiency)
        self.db.add(db_deficiency)
        self.db.commit()
        self.db.refresh(db_deficiency)
        return db_deficiency

    def get_facility_inspections(self, facility_id: UUID):
        return self.db.query(HealthInspection).filter(HealthInspection.facility_id == facility_id).all()
