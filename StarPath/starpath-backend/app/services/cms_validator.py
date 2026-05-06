"""
CMS Validation Service
Validates facility data against official CMS Five-Star Quality Rating System requirements
"""
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
import re

class ValidationError:
    """Represents a validation error"""
    def __init__(self, field: str, message: str, severity: str = "error"):
        self.field = field
        self.message = message
        self.severity = severity  # "error" or "warning"
    
    def to_dict(self) -> Dict[str, str]:
        return {
            "field": self.field,
            "message": self.message,
            "severity": self.severity
        }

class CMSValidator:
    """
    Validates facility data against CMS requirements
    Based on CMS Five-Star Quality Rating System specifications
    """
    
    # CMS Provider ID must be 6 digits
    CMS_PROVIDER_ID_PATTERN = r'^\d{6}$'
    
    # Required fields for facility submission
    REQUIRED_FACILITY_FIELDS = {
        'cms_provider_id': str,
        'name': str,
        'address': str,
        'city': str,
        'state': str,
        'zip_code': str,
        'bed_count': int,
    }
    
    # Valid states
    VALID_STATES = {
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    }
    
    # Valid inspection types
    VALID_INSPECTION_TYPES = {
        'standard', 'complaint', 'focused', 'initial', 'unannounced',
        'recertification', 'abbreviated_survey'
    }
    
    # Valid deficiency severities
    VALID_DEFICIENCY_SEVERITIES = {'Type A', 'Type B', 'Type C'}
    
    # Star rating must be 1-5
    VALID_STAR_RATINGS = {1, 2, 3, 4, 5}
    
    def __init__(self):
        self.errors: List[ValidationError] = []
        self.warnings: List[ValidationError] = []
    
    def validate_facility_data(
        self,
        facility: Dict[str, Any],
        ratings: List[Dict[str, Any]],
        inspections: List[Dict[str, Any]]
    ) -> Tuple[bool, List[Dict], List[Dict]]:
        """
        Validate complete facility submission
        
        Returns:
            (is_valid, errors, warnings)
        """
        self.errors = []
        self.warnings = []
        
        # Validate facility
        self._validate_facility(facility)
        
        # Validate ratings
        self._validate_ratings(ratings)
        
        # Validate inspections
        self._validate_inspections(inspections)
        
        is_valid = len(self.errors) == 0
        
        return is_valid, [e.to_dict() for e in self.errors], [w.to_dict() for w in self.warnings]
    
    # ============= Facility Validation =============
    
    def _validate_facility(self, facility: Dict[str, Any]):
        """Validate facility information"""
        
        if not facility:
            self.errors.append(ValidationError('facility', 'Facility data is required'))
            return
        
        # Check required fields
        for field, field_type in self.REQUIRED_FACILITY_FIELDS.items():
            if field not in facility or facility[field] is None:
                self.errors.append(ValidationError(f'facility.{field}', f'{field} is required'))
            elif not isinstance(facility.get(field), field_type):
                self.errors.append(ValidationError(
                    f'facility.{field}',
                    f'{field} must be {field_type.__name__}'
                ))
        
        # Validate CMS Provider ID format
        cms_id = facility.get('cms_provider_id')
        if cms_id and not re.match(self.CMS_PROVIDER_ID_PATTERN, str(cms_id)):
            self.errors.append(ValidationError(
                'facility.cms_provider_id',
                'CMS Provider ID must be 6 digits'
            ))
        
        # Validate facility name
        name = facility.get('name', '').strip()
        if name and len(name) < 3:
            self.errors.append(ValidationError(
                'facility.name',
                'Facility name must be at least 3 characters'
            ))
        if name and len(name) > 255:
            self.errors.append(ValidationError(
                'facility.name',
                'Facility name must not exceed 255 characters'
            ))
        
        # Validate state
        state = facility.get('state', '').upper()
        if state and state not in self.VALID_STATES:
            self.errors.append(ValidationError(
                'facility.state',
                f'State must be a valid US state abbreviation'
            ))
        
        # Validate zip code format
        zip_code = facility.get('zip_code', '').strip()
        if zip_code and not re.match(r'^\d{5}(-\d{4})?$', zip_code):
            self.errors.append(ValidationError(
                'facility.zip_code',
                'ZIP code must be in format XXXXX or XXXXX-XXXX'
            ))
        
        # Validate bed count
        bed_count = facility.get('bed_count')
        if bed_count is not None:
            if not isinstance(bed_count, int) or bed_count <= 0:
                self.errors.append(ValidationError(
                    'facility.bed_count',
                    'Bed count must be a positive integer'
                ))
            elif bed_count > 1000:
                self.warnings.append(ValidationError(
                    'facility.bed_count',
                    'Bed count seems unusually high',
                    'warning'
                ))
    
    # ============= Ratings Validation =============
    
    def _validate_ratings(self, ratings: List[Dict[str, Any]]):
        """Validate star ratings"""
        
        if not ratings:
            self.warnings.append(ValidationError(
                'ratings',
                'No ratings provided',
                'warning'
            ))
            return
        
        for i, rating in enumerate(ratings):
            prefix = f'ratings[{i}]'
            
            # Check required rating fields
            if 'effective_date' not in rating:
                self.errors.append(ValidationError(
                    f'{prefix}.effective_date',
                    'Effective date is required for each rating'
                ))
            else:
                # Validate date is reasonable (not in future, not too old)
                try:
                    rating_date = self._parse_date(rating['effective_date'])
                    if rating_date > datetime.now():
                        self.errors.append(ValidationError(
                            f'{prefix}.effective_date',
                            'Rating date cannot be in the future'
                        ))
                    if rating_date < datetime.now() - timedelta(days=365*3):
                        self.warnings.append(ValidationError(
                            f'{prefix}.effective_date',
                            'Rating is more than 3 years old',
                            'warning'
                        ))
                except ValueError:
                    self.errors.append(ValidationError(
                        f'{prefix}.effective_date',
                        'Invalid date format'
                    ))
            
            # Validate overall rating
            if 'overall_rating' in rating:
                self._validate_star_rating(rating['overall_rating'], f'{prefix}.overall_rating')
            else:
                self.errors.append(ValidationError(
                    f'{prefix}.overall_rating',
                    'Overall rating is required'
                ))
            
            # Validate domain ratings
            for domain in ['health_inspection_rating', 'staffing_rating', 'qm_rating']:
                if domain in rating:
                    self._validate_star_rating(rating[domain], f'{prefix}.{domain}')
    
    def _validate_star_rating(self, rating: Any, field_name: str):
        """Validate a star rating value"""
        if rating is None:
            return  # Optional
        
        try:
            rating_int = int(rating)
            if rating_int not in self.VALID_STAR_RATINGS:
                self.errors.append(ValidationError(
                    field_name,
                    'Star rating must be between 1 and 5'
                ))
        except (ValueError, TypeError):
            self.errors.append(ValidationError(
                field_name,
                'Star rating must be a number'
            ))
    
    # ============= Inspections Validation =============
    
    def _validate_inspections(self, inspections: List[Dict[str, Any]]):
        """Validate health inspections"""
        
        if not inspections:
            self.warnings.append(ValidationError(
                'inspections',
                'No inspections provided',
                'warning'
            ))
            return
        
        for i, inspection in enumerate(inspections):
            prefix = f'inspections[{i}]'
            
            # Validate inspection date
            if 'inspection_date' not in inspection:
                self.errors.append(ValidationError(
                    f'{prefix}.inspection_date',
                    'Inspection date is required'
                ))
            else:
                try:
                    insp_date = self._parse_date(inspection['inspection_date'])
                    if insp_date > datetime.now():
                        self.errors.append(ValidationError(
                            f'{prefix}.inspection_date',
                            'Inspection date cannot be in the future'
                        ))
                except ValueError:
                    self.errors.append(ValidationError(
                        f'{prefix}.inspection_date',
                        'Invalid date format'
                    ))
            
            # Validate inspection type
            if 'inspection_type' in inspection:
                insp_type = inspection['inspection_type'].lower() if inspection['inspection_type'] else ''
                if insp_type not in self.VALID_INSPECTION_TYPES:
                    self.warnings.append(ValidationError(
                        f'{prefix}.inspection_type',
                        f'Unknown inspection type. Valid types: {", ".join(self.VALID_INSPECTION_TYPES)}',
                        'warning'
                    ))
            
            # Validate deficiencies
            if 'deficiencies' in inspection and inspection['deficiencies']:
                self._validate_deficiencies(
                    inspection['deficiencies'],
                    f'{prefix}.deficiencies'
                )
    
    def _validate_deficiencies(self, deficiencies: List[Dict[str, Any]], prefix: str):
        """Validate deficiencies"""
        
        for i, deficiency in enumerate(deficiencies):
            def_prefix = f'{prefix}[{i}]'
            
            # Validate F-tag
            if 'tag' not in deficiency:
                self.warnings.append(ValidationError(
                    f'{def_prefix}.tag',
                    'F-tag (regulation citation) recommended',
                    'warning'
                ))
            else:
                tag = str(deficiency.get('tag', '')).strip()
                if not re.match(r'^F\d{3}$', tag):
                    self.warnings.append(ValidationError(
                        f'{def_prefix}.tag',
                        'F-tag should be in format F### (e.g., F835)',
                        'warning'
                    ))
            
            # Validate severity
            if 'severity' in deficiency:
                severity = deficiency.get('severity', '').strip()
                if severity and severity not in self.VALID_DEFICIENCY_SEVERITIES:
                    self.warnings.append(ValidationError(
                        f'{def_prefix}.severity',
                        f'Severity should be one of: {", ".join(self.VALID_DEFICIENCY_SEVERITIES)}',
                        'warning'
                    ))
            
            # Validate description
            if 'description' not in deficiency or not deficiency.get('description', '').strip():
                self.warnings.append(ValidationError(
                    f'{def_prefix}.description',
                    'Deficiency description recommended',
                    'warning'
                ))
    
    # ============= Helper Methods =============
    
    @staticmethod
    def _parse_date(date_str: Any) -> datetime:
        """Parse date string to datetime"""
        if isinstance(date_str, datetime):
            return date_str
        
        date_str = str(date_str).strip()
        
        # Try common formats
        formats = [
            '%Y-%m-%d',
            '%Y-%m-%dT%H:%M:%S',
            '%m/%d/%Y',
            '%d/%m/%Y'
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        
        raise ValueError(f"Unable to parse date: {date_str}")
    
    def get_summary(self) -> Dict[str, Any]:
        """Get validation summary"""
        return {
            "total_errors": len(self.errors),
            "total_warnings": len(self.warnings),
            "is_valid": len(self.errors) == 0,
            "errors": [e.to_dict() for e in self.errors],
            "warnings": [w.to_dict() for w in self.warnings]
        }
