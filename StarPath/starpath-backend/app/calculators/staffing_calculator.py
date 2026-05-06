from typing import Dict, List
from decimal import Decimal
from app.models.pbj import PBJDailyStaffing

class StaffingCalculator:
    """Calculates staffing star rating following CMS PDPM case-mix methodology."""
    
    RN_JOB_CODES = [5, 6, 7]
    TOTAL_NURSE_JOB_CODES = [5, 6, 7, 8, 9, 10, 11, 12]
    AIDE_JOB_CODES = [11, 12]
    
    # Default cutpoints (should ideally be loaded from a config/DB)
    RN_DECILE_CUTPOINTS = {1: 0.000, 2: 0.420, 3: 0.540, 4: 0.640, 5: 0.720,
                           6: 0.800, 7: 0.880, 8: 0.980, 9: 1.100, 10: float('inf')}
    
    STAR_RATING_CUTPOINTS = {5: 320, 4: 255, 3: 205, 2: 155, 1: 0}
    
    def calculate_hprd(self, total_hours: Decimal, total_resident_days: int) -> Decimal:
        """Calculate Hours Per Resident Day."""
        if total_resident_days == 0:
            return Decimal(0)
        return total_hours / Decimal(total_resident_days)
    
    def calculate_case_mix_adjusted_hours(
        self,
        reported_hprd: Decimal,
        case_mix_ratio: Decimal,
        national_avg_hprd: Decimal
    ) -> Decimal:
        """Calculate case-mix adjusted HPRD."""
        if case_mix_ratio == 0 or national_avg_hprd == 0:
            return Decimal(0)
        return (reported_hprd / (case_mix_ratio * national_avg_hprd)) * national_avg_hprd
    
    def assign_decile_points(
        self,
        adjusted_hprd: Decimal,
        decile_cutpoints: Dict[int, float],
        max_points: int = 100
    ) -> int:
        """Assign points based on decile cutoffs."""
        for decile in range(10, 0, -1):
            if adjusted_hprd >= decile_cutpoints[decile]:
                return int((decile / 10) * max_points)
        return 0
    
    def calculate_staffing_rating(
        self,
        daily_staffing: List[PBJDailyStaffing],
        total_resident_days: int,
        weekend_resident_days: int,
        case_mix_ratio: Decimal,
        national_avg: Dict[str, Decimal]
    ) -> Dict:
        """Calculate complete staffing star rating."""
        
        # Calculate reported hours
        rn_hours = sum(r.hours for r in daily_staffing if r.job_code in self.RN_JOB_CODES)
        total_hours = sum(r.hours for r in daily_staffing if r.job_code in self.TOTAL_NURSE_JOB_CODES)
        
        # Calculate HPRD
        rn_hprd = self.calculate_hprd(rn_hours, total_resident_days)
        total_hprd = self.calculate_hprd(total_hours, total_resident_days)
        
        # Case-mix adjust
        adj_rn_hprd = self.calculate_case_mix_adjusted_hours(rn_hprd, case_mix_ratio, national_avg['rn'])
        adj_total_hprd = self.calculate_case_mix_adjusted_hours(total_hprd, case_mix_ratio, national_avg['total'])
        
        # Assign points
        rn_points = self.assign_decile_points(adj_rn_hprd, self.RN_DECILE_CUTPOINTS, 100)
        total_points = self.assign_decile_points(adj_total_hprd, self.RN_DECILE_CUTPOINTS, 100)
        
        total_score = rn_points + total_points
        rating = self._assign_rating_from_score(total_score)
        
        return {
            "rating": rating,
            "score": total_score,
            "breakdown": {"rn_points": rn_points, "total_points": total_points},
            "hours": {"rn_adjusted": float(adj_rn_hprd), "total_adjusted": float(adj_total_hprd)}
        }
    
    def _assign_rating_from_score(self, score: int) -> int:
        """Assign star rating based on total points."""
        for rating in range(5, 0, -1):
            if score >= self.STAR_RATING_CUTPOINTS[rating]:
                return rating
        return 1
