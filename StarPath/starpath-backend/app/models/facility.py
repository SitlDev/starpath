from sqlalchemy import Column, String, Integer, JSON, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database import Base

class Facility(Base):
    __tablename__ = "facilities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cms_provider_id = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    address = Column(JSON)  # {street, city, state, zip}
    ownership = Column(String(100))
    bed_count = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    health_inspections = relationship("HealthInspection", back_populates="facility")
    # pbj_submissions = relationship("PBJSubmission", back_populates="facility")
    star_ratings = relationship("StarRating", back_populates="facility")
