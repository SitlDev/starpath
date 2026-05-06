from sqlalchemy.orm import Session
from app.models.star_rating import StarRating
from app.models.facility import Facility
from uuid import UUID
from datetime import date, datetime

class OverallRatingService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_overall_rating(self, facility_id: UUID, effective_date: date):
        """
        Implementation of the three-step algorithm:
        1. Start with Health Inspection rating (1-5)
        2. Adjust by Staffing rating (+1 if 4 or 5, -1 if 1)
        3. Adjust by QM rating (+1 if 5, -1 if 1)
        
        Returns a StarRating object
        """
        # Verify facility exists
        facility = self.db.query(Facility).filter(Facility.id == facility_id).first()
        if not facility:
            return None
        
        # For MVP, using simulated scores (will integrate actual calculation logic later)
        health_inspection_rating = 4  # Base from health inspections
        staffing_rating = 4            # From PBJ staffing data
        quality_measures_rating = 3    # From quality measures data
        
        # Calculate final rating using adjustment logic
        final_rating = self._apply_adjustments(health_inspection_rating, staffing_rating, quality_measures_rating)
        
        # Create or update star rating record
        star_rating = StarRating(
            facility_id=facility_id,
            overall_rating=final_rating,
            health_inspection_rating=health_inspection_rating,
            staffing_rating=staffing_rating,
            qm_rating=quality_measures_rating,
            effective_date=effective_date
        )
        
        self.db.add(star_rating)
        self.db.commit()
        self.db.refresh(star_rating)
        return star_rating
    
    def _apply_adjustments(self, base_rating: int, staffing_rating: int, qm_rating: int) -> int:
        """Apply CMS Five-Star adjustment logic"""
        rating = base_rating
        
        # Staffing Adjustment
        if staffing_rating >= 4:
            rating += 1
        elif staffing_rating == 1:
            rating -= 1
            
        # QM Adjustment
        if qm_rating == 5:
            rating += 1
        elif qm_rating == 1:
            rating -= 1
            
        # Ensure rating is within 1-5
        return max(1, min(5, rating))
