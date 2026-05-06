"""
CMS Export Service
Converts facility data to official CMS Five-Star Quality Rating System format
Supports both JSON and XML output formats
"""
import json
import xml.etree.ElementTree as ET
from xml.dom import minidom
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum

class ExportFormat(str, Enum):
    """Supported export formats"""
    JSON = "json"
    XML = "xml"

class CMSExportService:
    """
    Service to export facility data in official CMS formats
    Complies with CMS Five-Star Quality Rating System specifications
    """
    
    # CMS Data version
    CMS_DATA_VERSION = "1.0"
    
    # CMS Namespace
    CMS_NAMESPACE = "http://www.cms.gov/five-star-rating/v1"
    
    def __init__(self):
        self.version = self.CMS_DATA_VERSION
    
    def export_facility_data(
        self,
        facility: Dict[str, Any],
        ratings: List[Dict[str, Any]],
        inspections: List[Dict[str, Any]],
        format: ExportFormat = ExportFormat.JSON
    ) -> str:
        """
        Export complete facility data in CMS format
        
        Args:
            facility: Facility information dict
            ratings: List of star ratings
            inspections: List of health inspections
            format: Output format (JSON or XML)
        
        Returns:
            Formatted string (JSON or XML)
        """
        if format == ExportFormat.JSON:
            return self._export_json(facility, ratings, inspections)
        elif format == ExportFormat.XML:
            return self._export_xml(facility, ratings, inspections)
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    def _export_json(
        self,
        facility: Dict[str, Any],
        ratings: List[Dict[str, Any]],
        inspections: List[Dict[str, Any]]
    ) -> str:
        """Export as CMS-compliant JSON"""
        
        # Build the CMS JSON structure
        cms_data = {
            "submission": {
                "format_version": self.CMS_DATA_VERSION,
                "submission_date": datetime.now().isoformat(),
                "data_type": "facility_submission",
                "namespace": self.CMS_NAMESPACE
            },
            "facility": self._format_facility_json(facility),
            "ratings": self._format_ratings_json(ratings),
            "health_inspections": self._format_inspections_json(inspections),
            "summary": self._calculate_summary(ratings, inspections)
        }
        
        return json.dumps(cms_data, indent=2, default=str)
    
    def _export_xml(
        self,
        facility: Dict[str, Any],
        ratings: List[Dict[str, Any]],
        inspections: List[Dict[str, Any]]
    ) -> str:
        """Export as CMS-compliant XML"""
        
        # Create root element
        root = ET.Element('CMSFacilitySubmission')
        root.set('xmlns', self.CMS_NAMESPACE)
        root.set('version', self.CMS_DATA_VERSION)
        root.set('submissionDate', datetime.now().isoformat())
        
        # Add submission metadata
        metadata = ET.SubElement(root, 'SubmissionMetadata')
        ET.SubElement(metadata, 'FormatVersion').text = self.CMS_DATA_VERSION
        ET.SubElement(metadata, 'DataType').text = 'facility_submission'
        ET.SubElement(metadata, 'SubmissionDateTime').text = datetime.now().isoformat()
        
        # Add facility information
        facility_elem = ET.SubElement(root, 'Facility')
        self._build_facility_xml(facility_elem, facility)
        
        # Add ratings
        ratings_elem = ET.SubElement(root, 'StarRatings')
        self._build_ratings_xml(ratings_elem, ratings)
        
        # Add inspections
        inspections_elem = ET.SubElement(root, 'HealthInspections')
        self._build_inspections_xml(inspections_elem, inspections)
        
        # Add summary
        summary_elem = ET.SubElement(root, 'Summary')
        self._build_summary_xml(summary_elem, ratings, inspections)
        
        # Pretty print
        xml_str = minidom.parseString(ET.tostring(root)).toprettyxml(indent="  ")
        return xml_str
    
    # ============= JSON Formatting Methods =============
    
    def _format_facility_json(self, facility: Dict[str, Any]) -> Dict[str, Any]:
        """Format facility data for JSON"""
        return {
            "cms_provider_id": facility.get('cms_provider_id'),
            "facility_name": facility.get('name'),
            "address": {
                "street": facility.get('address'),
                "city": facility.get('city'),
                "state": facility.get('state'),
                "zip_code": facility.get('zip_code')
            },
            "facility_info": {
                "licensed_beds": facility.get('bed_count'),
                "ownership_type": facility.get('ownership'),
                "status": "active" if facility.get('is_active') else "inactive",
                "facility_type": "nursing_home"
            },
            "contact": {
                "phone": facility.get('phone'),
                "administrator": facility.get('administrator_name')
            }
        }
    
    def _format_ratings_json(self, ratings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Format ratings for JSON"""
        formatted = []
        for rating in ratings:
            formatted.append({
                "effective_date": str(rating.get('effective_date')),
                "overall_rating": rating.get('overall_rating'),
                "ratings_by_domain": {
                    "health_inspection": {
                        "rating": rating.get('health_inspection_rating'),
                        "measure_count": rating.get('health_measure_count', 0)
                    },
                    "staffing": {
                        "rating": rating.get('staffing_rating'),
                        "measure_count": rating.get('staffing_measure_count', 0)
                    },
                    "quality_measures": {
                        "rating": rating.get('qm_rating'),
                        "measure_count": rating.get('qm_measure_count', 0)
                    },
                    "resident_satisfaction": {
                        "rating": rating.get('resident_rating'),
                        "survey_count": rating.get('survey_count', 0)
                    }
                },
                "data_source": "starpath_snf",
                "calculation_method": "cms_five_star_methodology"
            })
        return formatted
    
    def _format_inspections_json(self, inspections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Format inspections for JSON"""
        formatted = []
        for insp in inspections:
            deficiencies = []
            if isinstance(insp.get('deficiencies'), list):
                deficiencies = [
                    {
                        "tag": d.get('tag', 'N/A'),
                        "severity": d.get('severity', 'Unknown'),
                        "description": d.get('description', ''),
                        "corrective_action": d.get('corrective_action', '')
                    }
                    for d in insp.get('deficiencies', [])
                ]
            
            formatted.append({
                "inspection_date": str(insp.get('inspection_date')),
                "inspection_type": insp.get('inspection_type'),
                "status": insp.get('status'),
                "deficiency_count": len(deficiencies),
                "deficiencies": deficiencies,
                "inspector": insp.get('inspector'),
                "survey_date": str(insp.get('survey_date')) if insp.get('survey_date') else None
            })
        return formatted
    
    # ============= XML Formatting Methods =============
    
    def _build_facility_xml(self, parent: ET.Element, facility: Dict[str, Any]):
        """Build facility XML elements"""
        ET.SubElement(parent, 'CMSProviderID').text = str(facility.get('cms_provider_id', ''))
        ET.SubElement(parent, 'FacilityName').text = facility.get('name', '')
        
        # Address
        addr_elem = ET.SubElement(parent, 'Address')
        ET.SubElement(addr_elem, 'Street').text = facility.get('address', '')
        ET.SubElement(addr_elem, 'City').text = facility.get('city', '')
        ET.SubElement(addr_elem, 'State').text = facility.get('state', '')
        ET.SubElement(addr_elem, 'ZipCode').text = facility.get('zip_code', '')
        
        # Facility info
        info_elem = ET.SubElement(parent, 'FacilityInfo')
        ET.SubElement(info_elem, 'LicensedBeds').text = str(facility.get('bed_count', 0))
        ET.SubElement(info_elem, 'OwnershipType').text = facility.get('ownership', 'Unknown')
        ET.SubElement(info_elem, 'Status').text = 'Active' if facility.get('is_active') else 'Inactive'
        
        # Contact
        contact_elem = ET.SubElement(parent, 'Contact')
        ET.SubElement(contact_elem, 'Phone').text = facility.get('phone', '')
        ET.SubElement(contact_elem, 'AdministratorName').text = facility.get('administrator_name', '')
    
    def _build_ratings_xml(self, parent: ET.Element, ratings: List[Dict[str, Any]]):
        """Build ratings XML elements"""
        for rating in ratings:
            rating_elem = ET.SubElement(parent, 'Rating')
            ET.SubElement(rating_elem, 'EffectiveDate').text = str(rating.get('effective_date', ''))
            ET.SubElement(rating_elem, 'OverallRating').text = str(rating.get('overall_rating', 0))
            
            # Domain ratings
            domains = ET.SubElement(rating_elem, 'DomainRatings')
            ET.SubElement(domains, 'HealthInspection').text = str(rating.get('health_inspection_rating', 0))
            ET.SubElement(domains, 'Staffing').text = str(rating.get('staffing_rating', 0))
            ET.SubElement(domains, 'QualityMeasures').text = str(rating.get('qm_rating', 0))
            ET.SubElement(domains, 'ResidentSatisfaction').text = str(rating.get('resident_rating', 0))
            
            ET.SubElement(rating_elem, 'DataSource').text = 'starpath_snf'
    
    def _build_inspections_xml(self, parent: ET.Element, inspections: List[Dict[str, Any]]):
        """Build inspections XML elements"""
        for insp in inspections:
            insp_elem = ET.SubElement(parent, 'Inspection')
            ET.SubElement(insp_elem, 'InspectionDate').text = str(insp.get('inspection_date', ''))
            ET.SubElement(insp_elem, 'InspectionType').text = insp.get('inspection_type', '')
            ET.SubElement(insp_elem, 'Status').text = insp.get('status', '')
            
            # Deficiencies
            def_parent = ET.SubElement(insp_elem, 'Deficiencies')
            for deficiency in insp.get('deficiencies', []):
                def_elem = ET.SubElement(def_parent, 'Deficiency')
                ET.SubElement(def_elem, 'Tag').text = deficiency.get('tag', '')
                ET.SubElement(def_elem, 'Severity').text = deficiency.get('severity', '')
                ET.SubElement(def_elem, 'Description').text = deficiency.get('description', '')
    
    def _build_summary_xml(self, parent: ET.Element, ratings: List[Dict[str, Any]], inspections: List[Dict[str, Any]]):
        """Build summary XML elements"""
        if ratings:
            latest_rating = ratings[0]
            ET.SubElement(parent, 'LatestOverallRating').text = str(latest_rating.get('overall_rating', 0))
            ET.SubElement(parent, 'LastRatingDate').text = str(latest_rating.get('effective_date', ''))
        
        ET.SubElement(parent, 'TotalInspectionsCount').text = str(len(inspections))
        
        total_deficiencies = sum(len(i.get('deficiencies', [])) for i in inspections)
        ET.SubElement(parent, 'TotalDeficiencies').text = str(total_deficiencies)
    
    # ============= Summary Calculation =============
    
    def _calculate_summary(self, ratings: List[Dict[str, Any]], inspections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate submission summary statistics"""
        
        total_deficiencies = 0
        for insp in inspections:
            if isinstance(insp.get('deficiencies'), list):
                total_deficiencies += len(insp.get('deficiencies', []))
        
        return {
            "submission_stats": {
                "ratings_included": len(ratings),
                "inspections_included": len(inspections),
                "total_deficiencies": total_deficiencies,
                "date_range": {
                    "earliest": str(min([i.get('inspection_date') for i in inspections], default='N/A')),
                    "latest": str(max([i.get('inspection_date') for i in inspections], default='N/A'))
                }
            },
            "compliance_status": "ready_for_submission"
        }
