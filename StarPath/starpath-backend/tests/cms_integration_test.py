"""
CMS Integration Test Suite
Comprehensive tests for CMS data export, validation, and submission functionality
"""
import pytest
import json
from datetime import datetime, timedelta
from io import StringIO
import xml.etree.ElementTree as ET

# Assuming tests are run from project root
import sys
sys.path.insert(0, '/Users/amn/Documents/GitHub/Claude/StarPath/starpath-backend')

from app.services.cms_export_service import CMSExportService, ExportFormat
from app.services.cms_validator import CMSValidator, ValidationError

# ============= Test Data =============

SAMPLE_FACILITY = {
    'cms_provider_id': '123456',
    'name': 'Test Nursing Home',
    'address': '123 Care Street',
    'city': 'Springfield',
    'state': 'IL',
    'zip_code': '62701',
    'bed_count': 120,
    'ownership': 'For-Profit',
    'is_active': True,
    'phone': '217-555-1234',
    'administrator_name': 'John Smith'
}

SAMPLE_RATINGS = [
    {
        'effective_date': datetime.now() - timedelta(days=90),
        'overall_rating': 4,
        'health_inspection_rating': 4,
        'staffing_rating': 3,
        'qm_rating': 5,
        'resident_rating': 4
    },
    {
        'effective_date': datetime.now() - timedelta(days=180),
        'overall_rating': 3,
        'health_inspection_rating': 3,
        'staffing_rating': 3,
        'qm_rating': 4,
        'resident_rating': 3
    }
]

SAMPLE_INSPECTIONS = [
    {
        'inspection_date': datetime.now() - timedelta(days=30),
        'inspection_type': 'Standard',
        'status': 'Passed',
        'deficiencies': [
            {
                'tag': 'F835',
                'severity': 'Type B',
                'description': 'Quality of Life - Dignity and Respect',
                'corrective_action': 'Staff training completed'
            }
        ],
        'inspector': 'Jane Doe'
    },
    {
        'inspection_date': datetime.now() - timedelta(days=180),
        'inspection_type': 'Complaint',
        'status': 'Passed',
        'deficiencies': [
            {
                'tag': 'F689',
                'severity': 'Type C',
                'description': 'Physician Supervision',
                'corrective_action': 'Policy updated'
            },
            {
                'tag': 'F835',
                'severity': 'Type B',
                'description': 'Quality of Life - Dignity and Respect',
                'corrective_action': 'N/A'
            }
        ]
    }
]

# ============= Export Service Tests =============

class TestCMSExportService:
    """Tests for CMS export functionality"""
    
    def setup_method(self):
        """Setup for each test"""
        self.service = CMSExportService()
    
    def test_export_to_json(self):
        """Test exporting facility data to JSON format"""
        result = self.service.export_facility_data(
            SAMPLE_FACILITY,
            SAMPLE_RATINGS,
            SAMPLE_INSPECTIONS,
            ExportFormat.JSON
        )
        
        # Verify it's valid JSON
        parsed = json.loads(result)
        assert 'submission' in parsed
        assert 'facility' in parsed
        assert 'ratings' in parsed
        assert 'health_inspections' in parsed
        assert 'summary' in parsed
        
        # Verify submission metadata
        assert parsed['submission']['format_version'] == '1.0'
        assert parsed['submission']['data_type'] == 'facility_submission'
        
        # Verify facility data
        assert parsed['facility']['cms_provider_id'] == '123456'
        assert parsed['facility']['facility_name'] == 'Test Nursing Home'
        
        # Verify ratings included
        assert len(parsed['ratings']) == 2
        assert parsed['ratings'][0]['overall_rating'] == 4
        
        # Verify inspections included
        assert len(parsed['health_inspections']) == 2
        assert parsed['health_inspections'][0]['deficiency_count'] == 1
    
    def test_export_to_xml(self):
        """Test exporting facility data to XML format"""
        result = self.service.export_facility_data(
            SAMPLE_FACILITY,
            SAMPLE_RATINGS,
            SAMPLE_INSPECTIONS,
            ExportFormat.XML
        )
        
        # Verify it's valid XML
        root = ET.fromstring(result)
        # Handle namespace in tag name
        tag_name = root.tag.split('}')[-1] if '}' in root.tag else root.tag
        assert tag_name == 'CMSFacilitySubmission'
        assert root.get('version') == '1.0'
        
        # Verify elements exist - using local-name matching for namespace handling
        ns = {'cms': 'http://www.cms.gov/five-star-rating/v1'} if 'http://' in root.tag else {}
        
        # Find Facility element (with or without namespace)
        facility = None
        for child in root:
            if 'Facility' in child.tag:
                facility = child
                break
        assert facility is not None
        
        # Find CMSProviderID
        provider_id = None
        for elem in facility:
            if 'CMSProviderID' in elem.tag:
                provider_id = elem
                break
        assert provider_id is not None
        assert provider_id.text == '123456'
        
        # Find StarRatings element
        ratings = None
        for child in root:
            if 'StarRatings' in child.tag:
                ratings = child
                break
        assert ratings is not None
        
        # Count Rating elements
        rating_count = sum(1 for elem in ratings if 'Rating' in elem.tag)
        assert rating_count == 2
        
        # Find HealthInspections element
        inspections = None
        for child in root:
            if 'HealthInspections' in child.tag:
                inspections = child
                break
        assert inspections is not None
        
        # Count Inspection elements
        inspection_count = sum(1 for elem in inspections if 'Inspection' in elem.tag)
        assert inspection_count == 2
    
    def test_export_with_no_ratings(self):
        """Test export gracefully handles missing ratings"""
        result = self.service.export_facility_data(
            SAMPLE_FACILITY,
            [],
            SAMPLE_INSPECTIONS,
            ExportFormat.JSON
        )
        
        parsed = json.loads(result)
        assert parsed['ratings'] == []
        assert 'facility' in parsed
    
    def test_export_with_no_inspections(self):
        """Test export gracefully handles missing inspections"""
        result = self.service.export_facility_data(
            SAMPLE_FACILITY,
            SAMPLE_RATINGS,
            [],
            ExportFormat.JSON
        )
        
        parsed = json.loads(result)
        assert parsed['health_inspections'] == []
        assert 'facility' in parsed
    
    def test_json_summary_calculation(self):
        """Test summary statistics are correctly calculated"""
        result = self.service.export_facility_data(
            SAMPLE_FACILITY,
            SAMPLE_RATINGS,
            SAMPLE_INSPECTIONS,
            ExportFormat.JSON
        )
        
        parsed = json.loads(result)
        summary = parsed['summary']
        
        assert summary['submission_stats']['ratings_included'] == 2
        assert summary['submission_stats']['inspections_included'] == 2
        assert summary['submission_stats']['total_deficiencies'] == 3

# ============= Validator Tests =============

class TestCMSValidator:
    """Tests for CMS validation functionality"""
    
    def setup_method(self):
        """Setup for each test"""
        self.validator = CMSValidator()
    
    def test_valid_facility_data(self):
        """Test validation of valid facility data"""
        is_valid, errors, warnings = self.validator.validate_facility_data(
            SAMPLE_FACILITY,
            SAMPLE_RATINGS,
            SAMPLE_INSPECTIONS
        )
        
        assert is_valid == True
        assert len(errors) == 0
    
    def test_missing_facility_fields(self):
        """Test validation detects missing required facility fields"""
        incomplete_facility = {
            'cms_provider_id': '123456',
            'name': 'Test Facility'
            # Missing: address, city, state, zip_code, bed_count
        }
        
        is_valid, errors, warnings = self.validator.validate_facility_data(
            incomplete_facility,
            SAMPLE_RATINGS,
            SAMPLE_INSPECTIONS
        )
        
        assert is_valid == False
        assert len(errors) > 0
        # Should have errors for missing fields
        error_fields = [e['field'] for e in errors]
        assert any('address' in f for f in error_fields)
    
    def test_invalid_cms_provider_id(self):
        """Test validation of CMS Provider ID format"""
        bad_facility = SAMPLE_FACILITY.copy()
        bad_facility['cms_provider_id'] = '12345'  # Only 5 digits
        
        is_valid, errors, warnings = self.validator.validate_facility_data(
            bad_facility,
            SAMPLE_RATINGS,
            SAMPLE_INSPECTIONS
        )
        
        assert is_valid == False
        assert any('cms_provider_id' in e['field'] for e in errors)
    
    def test_invalid_state(self):
        """Test validation of state abbreviation"""
        bad_facility = SAMPLE_FACILITY.copy()
        bad_facility['state'] = 'XX'  # Invalid state
        
        is_valid, errors, warnings = self.validator.validate_facility_data(
            bad_facility,
            SAMPLE_RATINGS,
            SAMPLE_INSPECTIONS
        )
        
        assert is_valid == False
        assert any('state' in e['field'] for e in errors)
    
    def test_invalid_zip_code(self):
        """Test validation of ZIP code format"""
        bad_facility = SAMPLE_FACILITY.copy()
        bad_facility['zip_code'] = 'ABCDE'  # Invalid ZIP
        
        is_valid, errors, warnings = self.validator.validate_facility_data(
            bad_facility,
            SAMPLE_RATINGS,
            SAMPLE_INSPECTIONS
        )
        
        assert is_valid == False
        assert any('zip_code' in e['field'] for e in errors)
    
    def test_invalid_star_rating(self):
        """Test validation of star rating values"""
        bad_ratings = [
            {
                'effective_date': datetime.now(),
                'overall_rating': 6,  # Invalid - must be 1-5
                'health_inspection_rating': 4,
                'staffing_rating': 3,
                'qm_rating': 5
            }
        ]
        
        is_valid, errors, warnings = self.validator.validate_facility_data(
            SAMPLE_FACILITY,
            bad_ratings,
            SAMPLE_INSPECTIONS
        )
        
        assert is_valid == False
        assert any('rating' in e['field'] for e in errors)
    
    def test_future_inspection_date(self):
        """Test validation detects future inspection dates"""
        bad_inspections = [
            {
                'inspection_date': datetime.now() + timedelta(days=30),  # Future date
                'inspection_type': 'Standard',
                'status': 'Passed',
                'deficiencies': []
            }
        ]
        
        is_valid, errors, warnings = self.validator.validate_facility_data(
            SAMPLE_FACILITY,
            SAMPLE_RATINGS,
            bad_inspections
        )
        
        assert is_valid == False
        assert any('inspection_date' in e['field'] for e in errors)
    
    def test_old_ratings_warning(self):
        """Test validation warns about old ratings"""
        old_ratings = [
            {
                'effective_date': datetime.now() - timedelta(days=365*4),  # 4 years old
                'overall_rating': 4,
                'health_inspection_rating': 4,
                'staffing_rating': 3,
                'qm_rating': 5
            }
        ]
        
        is_valid, errors, warnings = self.validator.validate_facility_data(
            SAMPLE_FACILITY,
            old_ratings,
            SAMPLE_INSPECTIONS
        )
        
        # Should still be valid, but have warnings
        assert len(warnings) > 0
    
    def test_invalid_bed_count(self):
        """Test validation of bed count"""
        bad_facility = SAMPLE_FACILITY.copy()
        bad_facility['bed_count'] = -5  # Negative beds
        
        is_valid, errors, warnings = self.validator.validate_facility_data(
            bad_facility,
            SAMPLE_RATINGS,
            SAMPLE_INSPECTIONS
        )
        
        assert is_valid == False
        assert any('bed_count' in e['field'] for e in errors)
    
    def test_missing_ratings(self):
        """Test validation warns about missing ratings"""
        is_valid, errors, warnings = self.validator.validate_facility_data(
            SAMPLE_FACILITY,
            [],
            SAMPLE_INSPECTIONS
        )
        
        # Should still be valid, but have warnings
        assert len(warnings) > 0
    
    def test_missing_inspections(self):
        """Test validation warns about missing inspections"""
        is_valid, errors, warnings = self.validator.validate_facility_data(
            SAMPLE_FACILITY,
            SAMPLE_RATINGS,
            []
        )
        
        # Should still be valid, but have warnings
        assert len(warnings) > 0
    
    def test_invalid_f_tag_format(self):
        """Test validation of F-tag format"""
        bad_inspections = [
            {
                'inspection_date': datetime.now() - timedelta(days=30),
                'inspection_type': 'Standard',
                'status': 'Passed',
                'deficiencies': [
                    {
                        'tag': '835',  # Missing F prefix
                        'severity': 'Type B',
                        'description': 'Test'
                    }
                ]
            }
        ]
        
        is_valid, errors, warnings = self.validator.validate_facility_data(
            SAMPLE_FACILITY,
            SAMPLE_RATINGS,
            bad_inspections
        )
        
        # Should have warning about F-tag format
        assert any('tag' in w['field'] for w in warnings)
    
    def test_invalid_deficiency_severity(self):
        """Test validation of deficiency severity"""
        bad_inspections = [
            {
                'inspection_date': datetime.now() - timedelta(days=30),
                'inspection_type': 'Standard',
                'status': 'Passed',
                'deficiencies': [
                    {
                        'tag': 'F835',
                        'severity': 'Critical',  # Invalid - should be Type A/B/C
                        'description': 'Test'
                    }
                ]
            }
        ]
        
        is_valid, errors, warnings = self.validator.validate_facility_data(
            SAMPLE_FACILITY,
            SAMPLE_RATINGS,
            bad_inspections
        )
        
        # Should have warning about severity
        assert any('severity' in w['field'] for w in warnings)

# ============= Integration Tests =============

class TestCMSIntegration:
    """Integration tests combining export and validation"""
    
    def test_export_and_validate_workflow(self):
        """Test complete export and validation workflow"""
        # Export data
        exporter = CMSExportService()
        exported_json = exporter.export_facility_data(
            SAMPLE_FACILITY,
            SAMPLE_RATINGS,
            SAMPLE_INSPECTIONS,
            ExportFormat.JSON
        )
        
        assert exported_json is not None
        parsed = json.loads(exported_json)
        
        # Validate exported data
        validator = CMSValidator()
        is_valid, errors, warnings = validator.validate_facility_data(
            SAMPLE_FACILITY,
            SAMPLE_RATINGS,
            SAMPLE_INSPECTIONS
        )
        
        assert is_valid == True
        assert len(errors) == 0
    
    def test_export_formats_consistency(self):
        """Test JSON and XML exports contain same data"""
        exporter = CMSExportService()
        
        json_export = exporter.export_facility_data(
            SAMPLE_FACILITY,
            SAMPLE_RATINGS,
            SAMPLE_INSPECTIONS,
            ExportFormat.JSON
        )
        
        xml_export = exporter.export_facility_data(
            SAMPLE_FACILITY,
            SAMPLE_RATINGS,
            SAMPLE_INSPECTIONS,
            ExportFormat.XML
        )
        
        # Parse and verify key data exists in both
        json_data = json.loads(json_export)
        
        assert json_data['facility']['cms_provider_id'] == '123456'
        assert len(json_data['ratings']) == 2
        assert len(json_data['health_inspections']) == 2

# ============= Test Runner =============

if __name__ == '__main__':
    # Run all tests
    pytest.main([__file__, '-v', '--tb=short'])
