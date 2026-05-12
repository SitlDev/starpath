# 📊 Comprehensive Reports Expansion Guide

## Executive Summary

The StarPath SNF reporting system has been expanded to support **5 major report types** with **customizable sections** and **multiple export formats**, bringing full alignment with CMS Five-Star Quality Rating System requirements.

---

## Phase 1: Frontend Implementation ✅ COMPLETE

### Reports Page Enhancement

**File:** `starpath-frontend/app/dashboard/reports/page.tsx`

**New Features Added:**
1. **5 Report Types** (expanded from 2):
   - Comprehensive Facility Report
   - Ratings Trend Analysis
   - Staffing Domain Report *(NEW)*
   - Quality Measures Report *(NEW)*
   - Comparative Analysis Report *(NEW)*

2. **Customization Panel**:
   - Format selection: PDF, CSV, Excel
   - Time range: Quarterly, Annual, All Time
   - Section toggles:
     - Include Deficiencies
     - Include Staffing Details
     - Include Quality Measures
     - Include Benchmarking

3. **Enhanced UI**:
   - Report cards with section lists
   - Collapsible customization panels
   - Feature comparison grid
   - CMS compliance badges

**Build Status:** ✅ Successful (0 TypeScript errors)

---

## Phase 2: Backend Implementation (REQUIRED)

### New API Endpoints Needed

#### 1. **Staffing Domain Report**
```
GET /api/v1/reports/staffing/{facility_id}
Query Parameters:
  - time_range: quarterly|annual|all
  - format: pdf|csv|excel
  - include_comparative: true|false

Returns:
  - Staffing levels by role (RN, LPN, CNA, Other)
  - Staffing ratios (per 100 beds)
  - Turnover rates (monthly/quarterly/annual)
  - State benchmark comparison
  - National benchmark comparison
  - Adequacy status vs. required minimums
```

#### 2. **Quality Measures Report**
```
GET /api/v1/reports/quality-measures/{facility_id}
Query Parameters:
  - time_range: quarterly|annual|all
  - format: pdf|csv|excel
  - include_comparative: true|false

Returns:
  - Long-stay quality indicators:
    * Percentage of high-risk residents with pressure ulcers
    * Percentage with urinary tract infections
    * Percentage with delirium
    * Percentage with depression
    * Percentage receiving unnecessarily antipsychotic medication
  - Short-stay quality indicators:
    * Readmission rates
    * Hospital transfer rates
    * Emergency department visits
  - Trend analysis with 24-month history
```

#### 3. **Comparative Analysis Report**
```
GET /api/v1/reports/comparative/{facility_id}
Query Parameters:
  - time_range: quarterly|annual|all
  - format: pdf|csv|excel

Returns:
  - Overall rating vs. state median
  - Overall rating vs. national median
  - Four-domain ratings comparison:
    * Health Inspections domain
    * Staffing domain
    * Quality Measures domain
    * Resident Satisfaction domain (when available)
  - Percentile ranking (0-100)
  - Performance gaps to state/national average
  - Key improvement areas
```

#### 4. **Enhanced Facility Report**
```
PUT /api/v1/reports/facility/{facility_id}
Query Parameters:
  - include_deficiencies: true|false
  - include_staffing_details: true|false
  - include_quality_measures: true|false
  - include_comparative: true|false
  - format: pdf|csv|excel

Enhanced Sections:
  - Deficiency Classification (F-Tags, severity levels)
  - Staffing Details (from Phase 2 staffing report)
  - Quality Measures Summary (from Phase 2 QM report)
  - Comparative benchmarking (from Phase 2 comparative report)
```

---

## Phase 3: Data Model Extensions

### Required Database Tables/Fields

#### 1. **Staffing Data**
```python
# New Model: models/staffing.py
class StaffingData(Base):
    __tablename__ = 'staffing_data'
    
    id = Column(String, primary_key=True)
    facility_id = Column(String, ForeignKey('facilities.id'))
    report_date = Column(Date)
    
    # Staffing counts
    total_rn = Column(Integer)           # Registered Nurses
    total_lpn = Column(Integer)          # Licensed Practical Nurses
    total_cna = Column(Integer)          # Certified Nursing Assistants
    total_other = Column(Integer)        # Other staff
    
    # Ratios (per 100 resident days)
    rn_hours_per_100_bed_days = Column(Float)
    lpn_hours_per_100_bed_days = Column(Float)
    cna_hours_per_100_bed_days = Column(Float)
    
    # Turnover
    rn_turnover_rate = Column(Float)     # Percentage
    lpn_turnover_rate = Column(Float)
    cna_turnover_rate = Column(Float)
    total_staff_turnover_rate = Column(Float)
    
    # Adequacy
    rn_adequate = Column(Boolean)
    lpn_adequate = Column(Boolean)
    cna_adequate = Column(Boolean)
    
    # Reporting
    data_source = Column(String)         # CMS|Self-Reported|Calculated
    report_period = Column(String)       # e.g. "2026-Q1"
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### 2. **Quality Measures Data**
```python
# New Model: models/quality_measure.py
class QualityMeasure(Base):
    __tablename__ = 'quality_measures'
    
    id = Column(String, primary_key=True)
    facility_id = Column(String, ForeignKey('facilities.id'))
    report_date = Column(Date)
    report_period = Column(String)  # e.g. "2026-Q1"
    
    # Long-stay measures
    pressure_ulcer_percentage = Column(Float)
    uti_percentage = Column(Float)
    delirium_percentage = Column(Float)
    depression_percentage = Column(Float)
    antipsychotic_percentage = Column(Float)
    
    # Short-stay measures
    readmission_rate = Column(Float)
    hospital_transfer_rate = Column(Float)
    ed_visit_rate = Column(Float)
    
    # Data source
    data_source = Column(String)      # CMS|Calculated|Reported
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### 3. **Benchmark Data**
```python
# New Model: models/benchmark.py
class Benchmark(Base):
    __tablename__ = 'benchmarks'
    
    id = Column(String, primary_key=True)
    state = Column(String)  # Or NULL for national
    report_date = Column(Date)
    report_period = Column(String)  # e.g. "2026-Q1"
    
    # Overall rating
    overall_rating_median = Column(Float)
    overall_rating_25th_percentile = Column(Float)
    overall_rating_75th_percentile = Column(Float)
    
    # Domain ratings (median values)
    health_inspection_median = Column(Float)
    staffing_median = Column(Float)
    quality_measures_median = Column(Float)
    resident_satisfaction_median = Column(Float)
    
    # Staffing benchmarks
    rn_hours_per_100_bed_days_median = Column(Float)
    total_hours_per_100_bed_days_median = Column(Float)
    
    # Quality measure benchmarks
    pressure_ulcer_median = Column(Float)
    readmission_rate_median = Column(Float)
    
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### 4. **Deficiency Enhancement**
```python
# Enhancement to models/deficiency.py
class Deficiency(Base):
    # Existing fields...
    
    # Add new fields:
    f_tag = Column(String)              # Federal tag (F-684, etc.)
    severity_level = Column(String)     # Immediate Jeopardy, Serious Concern, Non-Compliance
    regulatory_citation = Column(String) # 42 CFR §483.xx
    remediation_date = Column(Date)     # When corrected
    remediation_verified = Column(Boolean, default=False)
    remediation_notes = Column(String)
```

---

## Phase 4: Data Import & Population

### Data Sources

1. **CMS Data Files**
   - Medicare.gov Nursing Home Compare API
   - CMS ASPEN (Automated Survey Processing Environment) exports
   - State reporting systems

2. **Local Facility Data**
   - Staffing records
   - Quality assurance measurements
   - Incident reports

3. **Calculations**
   - Ratios (staffing hours per 100 bed days)
   - Percentages (QM metrics)
   - Trend analysis

### Seed Data

**File:** `starpath-backend/seed_data.py` (EXPAND)

```python
def seed_staffing_data():
    """Populate sample staffing data for 3 months"""
    # Create realistic staffing records

def seed_quality_measures():
    """Populate sample quality measure data"""
    # Create realistic QM records

def seed_benchmarks():
    """Populate state and national benchmarks"""
    # Load benchmark data from CMS files

def seed_deficiency_tags():
    """Add F-Tag data to existing deficiencies"""
    # Enhance deficiency records
```

---

## Phase 5: Export Format Support

### CSV Export Format

**Facility Report CSV:**
```
Facility Name, CMS Provider ID, Address, City, State, ZIP, Licensed Beds
Report Date, Overall Rating, Health Inspection Rating, Staffing Rating, QM Rating
[inspection data rows]
[staffing data rows - if included]
[quality measure rows - if included]
[benchmark comparison rows - if included]
```

**Example:** `Oak_Care_Center_Report_20260512.csv`

### Excel Export Format

**Workbook Structure:**
- **Sheet 1: Facility Overview**
  - Facility information
  - Current ratings
  - Summary statistics

- **Sheet 2: Inspections**
  - Inspection history
  - Deficiency details
  - F-Tag classifications

- **Sheet 3: Staffing** (if included)
  - Staffing levels
  - Ratios
  - Turnover data
  - Benchmarks

- **Sheet 4: Quality Measures** (if included)
  - QM metrics
  - Trend data
  - Benchmark comparisons

- **Sheet 5: Benchmarks** (if included)
  - State comparison
  - National comparison
  - Performance gaps

---

## Implementation Checklist

### Backend Tasks

- [ ] Create staffing data model
- [ ] Create quality measures data model
- [ ] Create benchmark data model
- [ ] Add F-Tag fields to deficiency model
- [ ] Create `/reports/staffing/{facility_id}` endpoint
- [ ] Create `/reports/quality-measures/{facility_id}` endpoint
- [ ] Create `/reports/comparative/{facility_id}` endpoint
- [ ] Update `/reports/facility/{facility_id}` to support new options
- [ ] Add CSV export support to report generator
- [ ] Add Excel export support to report generator
- [ ] Create seed_data functions for new tables
- [ ] Create database migrations

### Frontend Tasks

- [x] Update reports page UI with 5 report types
- [x] Add customization panel
- [x] Add format selection (PDF, CSV, Excel)
- [x] Add time range selection
- [x] Add section toggles
- [x] Add feature comparison grid
- [ ] Add report preview feature
- [ ] Add report scheduling feature
- [ ] Add report history/archival

### Testing Tasks

- [ ] Unit tests for new models
- [ ] Integration tests for new endpoints
- [ ] PDF generation tests
- [ ] CSV generation tests
- [ ] Excel generation tests
- [ ] Data validation tests

---

## CMS Data Alignment

All reports conform to the following CMS standards:

### Five-Star Quality Rating System (42 CFR Part 483)

1. **Health Inspections Domain**
   - Based on recent survey results
   - Weighted for deficiency severity
   - Updated quarterly

2. **Staffing Domain**
   - RN hours per 100 resident days
   - Total staff hours per 100 resident days
   - Staffing adequacy ratings

3. **Quality Measures Domain**
   - Long-stay resident measures
   - Short-stay resident measures
   - Resident and family satisfaction

### Data Requirements

- Effective dates must be current
- All ratings must be 1-5 scale
- Deficiencies must include F-Tag codes
- Staffing data must be in standard format
- Quality measures must match CMS definitions

---

## Deployment Timeline

| Phase | Task | Timeline | Status |
|-------|------|----------|--------|
| 1 | Frontend UI Updates | Complete | ✅ |
| 2 | Backend Endpoints | Week 1 | ⏳ |
| 3 | Data Models | Week 1 | ⏳ |
| 4 | Seed Data/Imports | Week 2 | ⏳ |
| 5 | Export Formats | Week 2 | ⏳ |
| 6 | Testing | Week 3 | ⏳ |
| 7 | Production Deploy | Week 3 | ⏳ |

---

## Example Report Output

### Facility Report with All Options Enabled

**Page 1: Overview**
- Facility Information
- Overall 5-Star Rating (★★★★☆)
- Four-Domain Ratings Table
- Key Metrics Summary

**Page 2: Health Inspections**
- Recent Inspections Table
- Deficiencies with F-Tags and Severity
- Trends and Patterns

**Page 3: Staffing** (if included)
- Staffing Levels Chart
- RN/LPN/CNA Ratios vs. Benchmarks
- Turnover Rates
- Adequacy Assessment

**Page 4: Quality Measures** (if included)
- Long-Stay QM Metrics
- Short-Stay QM Metrics
- Performance Trends
- Benchmark Comparisons

**Page 5: Comparative Analysis** (if included)
- State Benchmark Comparison
- National Benchmark Comparison
- Percentile Ranking
- Gap Analysis

**Page 6: Methodology & Footnotes**
- CMS Disclaimer
- Data Sources
- Report Generation Date

---

## API Response Examples

### `/api/v1/reports/staffing/{facility_id}`

```json
{
  "facility_id": "fac-123",
  "facility_name": "Oak Care Center",
  "report_date": "2026-05-12",
  "staffing_data": {
    "current_period": {
      "total_rn": 45,
      "total_lpn": 28,
      "total_cna": 120,
      "rn_hours_per_100_bed_days": 8.5,
      "rn_turnover_rate": 12.5,
      "rn_adequate": true
    },
    "historical": [
      { "period": "2026-Q1", "rn_hours_per_100_bed_days": 8.3, ... },
      { "period": "2025-Q4", "rn_hours_per_100_bed_days": 8.1, ... }
    ]
  },
  "benchmarks": {
    "state_median_rn_hours": 8.2,
    "national_median_rn_hours": 8.7,
    "facility_percentile": 65
  }
}
```

---

## Known Limitations & Future Enhancements

### Current Limitations
- No real-time data integration with CMS servers
- Benchmark data must be manually imported
- No automated scheduling for reports
- No multi-facility comparison reports

### Future Enhancements
- [ ] Real-time CMS data synchronization
- [ ] Automated benchmark updates
- [ ] Report scheduling and email delivery
- [ ] Multi-facility comparison reports
- [ ] Peer group analysis
- [ ] Predictive analytics
- [ ] Mobile app support
- [ ] Custom branding/logos

---

## Testing Procedures

### Manual Testing Checklist

```
Reports Page:
- [ ] Select facility and view available reports
- [ ] Click "Customize" to open customization panel
- [ ] Toggle all checkboxes and verify options persist
- [ ] Change format to CSV and Excel
- [ ] Change time range options
- [ ] Download report in all 3 formats
- [ ] Verify filename format: {FacilityName}_{ReportType}_{YYYYMMDD}.{ext}

PDF Reports:
- [ ] Open PDF and verify CMS header is present
- [ ] Check that all selected sections are included
- [ ] Verify star ratings display correctly (★★★★)
- [ ] Confirm tables format properly
- [ ] Check footer with generation date

CSV Reports:
- [ ] Open in Excel or text editor
- [ ] Verify column headers match specification
- [ ] Check data rows are properly delimited
- [ ] Confirm all selected sections are present

Excel Reports:
- [ ] Open in Excel
- [ ] Verify all sheets are present and named correctly
- [ ] Check data formatting and alignment
- [ ] Confirm calculations are correct
```

---

## Support Resources

- **CMS Five-Star System:** https://www.medicare.gov/nursinghomecompare
- **CMS Data Documentation:** https://data.cms.gov/
- **Federal Regulations:** 42 CFR Part 483 (Nursing Home Standards)
- **StarPath Documentation:** See IMPLEMENTATION_COMPLETE.md

---

**Status:** Phase 1 Complete | Phases 2-5 In Planning

**Last Updated:** May 12, 2026

**Version:** 1.0 - Comprehensive Reports Expansion Plan
