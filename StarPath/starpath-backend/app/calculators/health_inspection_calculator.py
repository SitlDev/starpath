from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from app.models.health_inspection import HealthInspection
from app.models.deficiency import Deficiency

class HealthInspectionCalculator:
    """
    Calculates health inspection star rating following CMS Technical Users' Guide
    methodology exactly.
    """
    
    # Table 1: Deficiency points by scope/severity
    DEFICIENCY_POINTS = {
        # Immediate Jeopardy (J, K, L)
        ('J', 'isolated'): 50,
        ('K', 'pattern'): 100,
        ('L', 'widespread'): 150,
        
        # Actual Harm (G, H, I)
        ('G', 'isolated'): 20,
        ('H', 'pattern'): 35,
        ('I', 'widespread'): 45,
        
        # No actual harm, potential > minimal (D, E, F)
        ('D', 'isolated'): 4,
        ('E', 'pattern'): 8,
        ('F', 'widespread'): 16,
        
        # No actual harm, minimal potential (A, B, C)
        ('A', 'isolated'): 0,
        ('B', 'pattern'): 0,
        ('C', 'widespread'): 0,
    }
    
    # Additional points for substandard quality of care
    SUBSTANDARD_QOC_BONUS = {
        'J': 25, 'K': 25, 'L': 25,
        'H': 5, 'I': 5,
        'F': 4
    }
    
    # Table 2: Revisit penalty multipliers
    REVISIT_MULTIPLIERS = {
        0: 0.00,  # No revisit
        1: 0.00,  # First revisit
        2: 0.50,  # Second revisit
        3: 0.70,  # Third revisit
        4: 0.85,  # Fourth+ revisit
    }
    
    def calculate_deficiency_points(self, deficiency: Deficiency) -> int:
        """Calculate points for a single deficiency using Table 1 logic."""
        scope_severity = (deficiency.severity, self._map_scope(deficiency.scope))
        base_points = self.DEFICIENCY_POINTS.get(scope_severity, 0)
        
        if deficiency.is_substandard_qoc:
            base_points += self.SUBSTANDARD_QOC_BONUS.get(deficiency.severity, 0)
        
        # Special case: Past non-compliance + IJ → G-level points
        if deficiency.is_past_non_compliance and deficiency.severity in ['J', 'K', 'L']:
            base_points = 20
        
        return base_points
    
    def _map_scope(self, scope_code: str) -> str:
        """Map scope code (D-L) to scope category."""
        mapping = {
            'D': 'isolated', 'E': 'pattern', 'F': 'widespread',
            'G': 'isolated', 'H': 'pattern', 'I': 'widespread',
            'J': 'isolated', 'K': 'pattern', 'L': 'widespread',
        }
        return mapping.get(scope_code, 'isolated')
    
    def calculate_survey_score(self, inspection: HealthInspection) -> int:
        """Calculate total points for a single survey."""
        total = 0
        for deficiency in inspection.deficiencies:
            total += self.calculate_deficiency_points(deficiency)
        return total
    
    def calculate_revisit_points(self, base_score: int, revisit_count: int) -> int:
        """Calculate additional points from revisits using Table 2 logic."""
        if revisit_count >= 4:
            revisit_count = 4
        
        multiplier = self.REVISIT_MULTIPLIERS.get(revisit_count, 0)
        return int(base_score * multiplier)
    
    def _get_complaints_in_period(self, complaints: List[HealthInspection], start_month: int, end_month: int, reference_date: datetime) -> List[HealthInspection]:
        """Filter complaints by date range."""
        start_date = reference_date - timedelta(days=end_month * 30.44)
        end_date = reference_date - timedelta(days=start_month * 30.44)
        return [c for c in complaints if start_date.date() <= c.survey_date < end_date.date()]

    def _get_ic_in_period(self, ic_surveys: List[HealthInspection], start_month: int, end_month: int, reference_date: datetime) -> List[HealthInspection]:
        """Filter IC surveys by date range."""
        start_date = reference_date - timedelta(days=end_month * 30.44)
        end_date = reference_date - timedelta(days=start_month * 30.44)
        return [ic for ic in ic_surveys if start_date.date() <= ic.survey_date < end_date.date()]

    def calculate_weighted_score(
        self,
        cycle1_inspection: HealthInspection,
        cycle2_inspection: HealthInspection | None,
        complaints: List[HealthInspection],
        ic_surveys: List[HealthInspection],
        reference_date: datetime
    ) -> Tuple[float, Dict]:
        """
        Calculate weighted health inspection score.
        """
        
        # Cycle 1 calculation
        cycle1_score = self.calculate_survey_score(cycle1_inspection)
        cycle1_complaints = self._get_complaints_in_period(complaints, 0, 12, reference_date)
        cycle1_ic = self._get_ic_in_period(ic_surveys, 0, 12, reference_date)
        
        cycle1_total = cycle1_score + sum(self.calculate_survey_score(c) for c in cycle1_complaints)
        cycle1_total += sum(self.calculate_survey_score(ic) for ic in cycle1_ic)
        cycle1_total += self.calculate_revisit_points(cycle1_total, cycle1_inspection.revisit_count)
        
        # Cycle 2 calculation (if exists)
        cycle2_total = 0
        if cycle2_inspection:
            cycle2_score = self.calculate_survey_score(cycle2_inspection)
            cycle2_complaints = self._get_complaints_in_period(complaints, 13, 36, reference_date)
            cycle2_ic = self._get_ic_in_period(ic_surveys, 13, 36, reference_date)
            
            cycle2_total = cycle2_score + sum(self.calculate_survey_score(c) for c in cycle2_complaints)
            cycle2_total += sum(self.calculate_survey_score(ic) for ic in cycle2_ic)
            cycle2_total += self.calculate_revisit_points(cycle2_total, cycle2_inspection.revisit_count)
        
        # Weighted average
        weighted_score = (cycle1_total * 0.75) + (cycle2_total * 0.25)
        
        return weighted_score, {
            "cycle1_total": cycle1_total,
            "cycle2_total": cycle2_total,
            "weighted_score": weighted_score
        }
    
    def assign_star_rating(
        self, 
        weighted_score: float, 
        state: str, 
        state_cutpoints: Dict,
        has_abuse_citation: bool
    ) -> int:
        """Assign star rating based on state percentile cutoffs."""
        # state_cutpoints structure: {"AL": {"5_star": 10.0, "4_star": 20.0, ...}}
        cuts = state_cutpoints.get(state, {})
        if weighted_score <= cuts.get('5_star', 0):
            rating = 5
        elif weighted_score <= cuts.get('4_star', 0):
            rating = 4
        elif weighted_score <= cuts.get('3_star', 0):
            rating = 3
        elif weighted_score <= cuts.get('2_star', 0):
            rating = 2
        else:
            rating = 1
        
        # Abuse citation caps at 2 stars
        if has_abuse_citation and rating > 2:
            rating = 2
        
        return rating
    
    def check_abuse_citation(self, inspections: List[HealthInspection]) -> bool:
        """Check if facility has F600-F610 citations in last 3 years."""
        abuse_tags = [f'F{i}' for i in range(600, 611)]
        cutoff_date = datetime.now() - timedelta(days=3*365)
        
        for inspection in inspections:
            if inspection.survey_date < cutoff_date.date():
                continue
            for deficiency in inspection.deficiencies:
                if deficiency.f_tag in abuse_tags:
                    return True
        
        return False
