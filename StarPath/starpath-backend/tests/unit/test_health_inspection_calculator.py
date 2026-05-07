import pytest
from datetime import date, datetime
from app.calculators.health_inspection_calculator import HealthInspectionCalculator
from app.models.health_inspection import HealthInspection, SurveyType
from app.models.deficiency import Deficiency

def test_calculate_deficiency_points():
    calculator = HealthInspectionCalculator()
    
    # Test D tag (4 points)
    deficiency_d = Deficiency(severity='D', scope='isolated', is_substandard_qoc=False)
    assert calculator.calculate_deficiency_points(deficiency_d) == 4
    
    # Test J tag (50 points)
    deficiency_j = Deficiency(severity='J', scope='isolated', is_substandard_qoc=False)
    assert calculator.calculate_deficiency_points(deficiency_j) == 50
    
    # Test J tag with Substandard QOC (50 + 25 = 75 points)
    deficiency_j_sqoc = Deficiency(severity='J', scope='isolated', is_substandard_qoc=True)
    assert calculator.calculate_deficiency_points(deficiency_j_sqoc) == 75

def test_calculate_survey_score():
    calculator = HealthInspectionCalculator()
    
    inspection = HealthInspection(survey_date=date(2026, 1, 1), survey_type=SurveyType.STANDARD)
    d1 = Deficiency(severity='D', scope='isolated', is_substandard_qoc=False)
    d2 = Deficiency(severity='F', scope='widespread', is_substandard_qoc=False) # 16 points
    inspection.deficiencies = [d1, d2]
    
    assert calculator.calculate_survey_score(inspection) == 20

def test_assign_star_rating():
    calculator = HealthInspectionCalculator()
    state_cutpoints = {
        "AL": {
            "5_star": 5.0,
            "4_star": 15.0,
            "3_star": 30.0,
            "2_star": 50.0
        }
    }
    
    assert calculator.assign_star_rating(4.0, "AL", state_cutpoints, False) == 5
    assert calculator.assign_star_rating(10.0, "AL", state_cutpoints, False) == 4
    assert calculator.assign_star_rating(25.0, "AL", state_cutpoints, False) == 3
    assert calculator.assign_star_rating(40.0, "AL", state_cutpoints, False) == 2
    assert calculator.assign_star_rating(60.0, "AL", state_cutpoints, False) == 1
    
    # Abuse citation cap
    assert calculator.assign_star_rating(4.0, "AL", state_cutpoints, True) == 2
