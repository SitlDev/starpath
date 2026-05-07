# CMS Integration API Documentation

## Overview

The CMS Integration API enables StarPath SNF facilities to export their quality ratings and inspection data to the Centers for Medicare & Medicaid Services (CMS) in official Five-Star Quality Rating format.

**Base URL:** `/api/v1/cms`

**Authentication:** All endpoints require JWT bearer token authentication

## Quick Start

### 1. Export Facility Data

Export a facility's ratings and inspection history in CMS-compliant format.

```bash
curl -X POST http://localhost:8001/api/v1/cms/export/FACILITY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "json"
  }'
```

**Formats:**
- `json` - CMS-compliant JSON structure (recommended for API submission)
- `xml` - CMS-compliant XML structure (alternative format)

**Response:**
```json
{
  "facility_id": "facility-123",
  "facility_name": "Care Home Inc",
  "cms_provider_id": "123456",
  "format": "json",
  "export_date": "2025-02-06T15:30:00Z",
  "data": {
    "submission": {...},
    "facility": {...},
    "ratings": [...],
    "health_inspections": [...]
  },
  "record_count": {
    "ratings": 24,
    "inspections": 8
  }
}
```

### 2. Validate Data Against CMS Requirements

Before submitting, validate that data meets all CMS requirements.

```bash
curl -X POST http://localhost:8001/api/v1/cms/validate/FACILITY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (Valid):**
```json
{
  "facility_id": "facility-123",
  "facility_name": "Care Home Inc",
  "cms_provider_id": "123456",
  "validation_date": "2025-02-06T15:30:00Z",
  "is_valid": true,
  "total_errors": 0,
  "total_warnings": 0,
  "errors": [],
  "warnings": [],
  "can_submit": true
}
```

**Response (Invalid):**
```json
{
  "facility_id": "facility-123",
  "facility_name": "Care Home Inc",
  "cms_provider_id": "123456",
  "validation_date": "2025-02-06T15:30:00Z",
  "is_valid": false,
  "total_errors": 2,
  "total_warnings": 1,
  "errors": [
    {
      "field": "cms_provider_id",
      "message": "CMS Provider ID must be 6 digits. Got: 12345",
      "severity": "error"
    },
    {
      "field": "state",
      "message": "Invalid state abbreviation: XX",
      "severity": "error"
    }
  ],
  "warnings": [
    {
      "field": "ratings",
      "message": "Latest rating is 89 days old. Recommend updating with recent data.",
      "severity": "warning"
    }
  ],
  "can_submit": false
}
```

### 3. Submit Data to CMS

Create a submission record after validation passes.

```bash
curl -X POST http://localhost:8001/api/v1/cms/submit/FACILITY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "submission_type": "facility_data",
    "include_inspection_history": true,
    "years_of_data": 3
  }'
```

**Response:**
```json
{
  "submission_id": "sub-550e8400-e29b-41d4-a716-446655440000",
  "status": "ACCEPTED",
  "facility_id": "facility-123",
  "facility_name": "Care Home Inc",
  "cms_provider_id": "123456",
  "submission_date": "2025-02-06T15:30:00Z",
  "validation_result": {
    "is_valid": true,
    "total_errors": 0,
    "total_warnings": 0,
    "can_submit": true
  },
  "errors": [],
  "warnings": []
}
```

### 4. Track Submission Status

```bash
curl -X GET http://localhost:8001/api/v1/cms/submissions/sub-550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "submission_id": "sub-550e8400-e29b-41d4-a716-446655440000",
  "status": "ACCEPTED",
  "facility_name": "Care Home Inc",
  "cms_provider_id": "123456",
  "submission_date": "2025-02-06T15:30:00Z",
  "validation_passed": true,
  "cms_response_date": null,
  "cms_confirmation_id": null,
  "retry_count": 0,
  "errors": []
}
```

---

## Detailed Endpoint Reference

### POST `/export/{facility_id}`

Export facility data in CMS format.

**Permission:** `download_reports`

**Path Parameters:**
- `facility_id` (string, required) - The facility UUID

**Request Body:**
```json
{
  "format": "json|xml"
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Export successful |
| 403 | Insufficient permissions |
| 404 | Facility not found |
| 500 | Export generation failed |

---

### POST `/validate/{facility_id}`

Validate facility data against CMS requirements.

**Permission:** None (all authenticated users)

**Path Parameters:**
- `facility_id` (string, required) - The facility UUID

**Validation Rules:**

#### Facility Fields
- **cms_provider_id**: Must be exactly 6 digits (format: XXXXXX)
- **name**: 3-255 characters
- **address**: Must not be empty
- **city**: Must not be empty
- **state**: Valid US state abbreviation (AL, AK, AZ... WI, WY)
- **zip_code**: XXXXX or XXXXX-XXXX format
- **bed_count**: Integer 1-1000
- **is_active**: Boolean (true/false)

#### Star Ratings
- **overall_rating**: Integer 1-5
- **health_inspection_rating**: Integer 1-5
- **staffing_rating**: Integer 1-5
- **qm_rating**: Integer 1-5
- **effective_date**: Not in future, not older than 3 years (warning only)

#### Health Inspections
- **inspection_date**: Not in future, required
- **inspection_type**: One of: Standard, Complaint, Focused, Initial, Unannounced, Recertification, Abbreviated Survey
- **status**: Valid submission status
- **deficiencies[].tag**: Format F#### (e.g., F835)
- **deficiencies[].severity**: Type A, Type B, or Type C

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Validation complete (may still have errors) |
| 404 | Facility not found |

---

### POST `/submit/{facility_id}`

Submit facility data to CMS (creates submission record).

**Permission:** `edit_facilities`

**Path Parameters:**
- `facility_id` (string, required) - The facility UUID

**Request Body:**
```json
{
  "submission_type": "facility_data",
  "include_inspection_history": true,
  "years_of_data": 3
}
```

**Parameters:**
- `submission_type`: Type of submission (default: "facility_data")
- `include_inspection_history`: Include past inspections (default: true)
- `years_of_data`: How many years of history to include (default: 3)

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Submission created |
| 400 | Validation failed - see errors in response |
| 403 | Insufficient permissions |
| 404 | Facility not found |
| 500 | Failed to create submission |

---

### POST `/submit/bulk`

Submit multiple facilities to CMS in one batch.

**Permission:** `edit_facilities` AND `admin` role

**Request Body:**
```json
{
  "facility_ids": [
    "facility-123",
    "facility-456",
    "facility-789"
  ],
  "submission_type": "batch",
  "comment": "Monthly batch submission - February 2025"
}
```

**Response:**
```json
{
  "batch_id": "batch-550e8400-e29b-41d4-a716-446655440000",
  "submission_count": 3,
  "status": "batch_created",
  "submissions": [
    {
      "submission_id": "sub-xxx",
      "facility_name": "Care Home Inc",
      "cms_provider_id": "123456",
      "status": "PENDING"
    }
  ]
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Batch submissions created |
| 403 | Insufficient permissions (requires admin) |
| 400 | Invalid facility IDs provided |

---

### GET `/submissions`

List all CMS submissions with optional filtering.

**Permission:** None (all authenticated users)

**Query Parameters:**
- `facility_id` (string, optional) - Filter by facility
- `status` (string, optional) - Filter by status (PENDING, SUBMITTED, ACCEPTED, REJECTED, FAILED, VALIDATION_ERROR)
- `limit` (integer, optional, default: 50, max: 100) - Results per page

**Response:**
```json
{
  "count": 3,
  "submissions": [
    {
      "submission_id": "sub-xxx",
      "facility_id": "facility-123",
      "facility_name": "Care Home Inc",
      "cms_provider_id": "123456",
      "submission_date": "2025-02-06T15:30:00Z",
      "submission_type": "facility_data",
      "status": "PENDING",
      "validation_passed": true,
      "cms_confirmation_id": null,
      "submitted_by": "admin@example.com"
    }
  ]
}
```

---

### GET `/submissions/{submission_id}`

Get detailed status of a specific submission.

**Permission:** None (all authenticated users)

**Path Parameters:**
- `submission_id` (string, required) - The submission UUID

**Response:**
```json
{
  "submission_id": "sub-550e8400-e29b-41d4-a716-446655440000",
  "status": "ACCEPTED",
  "facility_name": "Care Home Inc",
  "cms_provider_id": "123456",
  "submission_date": "2025-02-06T15:30:00Z",
  "validation_passed": true,
  "cms_response_date": null,
  "cms_confirmation_id": null,
  "retry_count": 0,
  "errors": []
}
```

**Submission Statuses:**
- `PENDING` - Awaiting CMS processing
- `SUBMITTED` - Sent to CMS
- `ACCEPTED` - CMS accepted the submission
- `REJECTED` - CMS rejected the submission
- `FAILED` - Submission failed during transmission
- `VALIDATION_ERROR` - Failed validation before submission

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Submission found |
| 404 | Submission not found |

---

### POST `/submissions/{submission_id}/retry`

Retry a failed CMS submission.

**Permission:** `edit_facilities`

**Path Parameters:**
- `submission_id` (string, required) - The submission UUID

**Response:**
```json
{
  "submission_id": "sub-550e8400-e29b-41d4-a716-446655440000",
  "status": "PENDING",
  "retry_count": 2,
  "message": "Submission queued for retry"
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Retry queued successfully |
| 400 | Cannot retry submission with current status |
| 403 | Insufficient permissions |
| 404 | Submission not found |

---

## Data Format Examples

### JSON Export Format

```json
{
  "submission": {
    "submission_id": "sub-xxx",
    "submission_date": "2025-02-06T15:30:00Z",
    "format_version": "1.0",
    "data_type": "facility_submission"
  },
  "facility": {
    "cms_provider_id": "123456",
    "facility_name": "Care Home Inc",
    "address": "123 Care Street",
    "city": "Springfield",
    "state": "IL",
    "zip_code": "62701",
    "bed_count": 120,
    "ownership": "For-Profit",
    "is_active": true
  },
  "ratings": [
    {
      "effective_date": "2025-02-06",
      "overall_rating": 4,
      "health_inspection_rating": 4,
      "staffing_rating": 3,
      "qm_rating": 5
    }
  ],
  "health_inspections": [
    {
      "inspection_date": "2025-01-15",
      "inspection_type": "Standard",
      "status": "Passed",
      "deficiency_count": 2,
      "deficiencies": [
        {
          "tag": "F835",
          "severity": "Type B",
          "description": "Quality of Life - Dignity and Respect"
        }
      ]
    }
  ],
  "summary": {
    "submission_stats": {
      "ratings_included": 24,
      "inspections_included": 8,
      "total_deficiencies": 15
    }
  }
}
```

### XML Export Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CMSFacilitySubmission version="1.0" xmlns="http://www.cms.gov/five-star-rating/v1">
  <Submission>
    <SubmissionID>sub-xxx</SubmissionID>
    <SubmissionDate>2025-02-06T15:30:00Z</SubmissionDate>
    <FormatVersion>1.0</FormatVersion>
  </Submission>
  <Facility>
    <CMSProviderID>123456</CMSProviderID>
    <FacilityName>Care Home Inc</FacilityName>
    <Address>123 Care Street</Address>
    <City>Springfield</City>
    <State>IL</State>
    <ZipCode>62701</ZipCode>
    <BedCount>120</BedCount>
  </Facility>
  <StarRatings>
    <Rating>
      <EffectiveDate>2025-02-06</EffectiveDate>
      <OverallRating>4</OverallRating>
      <HealthInspectionRating>4</HealthInspectionRating>
      <StaffingRating>3</StaffingRating>
      <QualityMeasuresRating>5</QualityMeasuresRating>
    </Rating>
  </StarRatings>
  <HealthInspections>
    <Inspection>
      <InspectionDate>2025-01-15</InspectionDate>
      <InspectionType>Standard</InspectionType>
      <Status>Passed</Status>
      <DeficiencyCount>2</DeficiencyCount>
      <Deficiencies>
        <Deficiency>
          <Tag>F835</Tag>
          <Severity>Type B</Severity>
          <Description>Quality of Life - Dignity and Respect</Description>
        </Deficiency>
      </Deficiencies>
    </Inspection>
  </HealthInspections>
  <Summary>
    <LatestOverallRating>4</LatestOverallRating>
    <TotalInspectionsCount>8</TotalInspectionsCount>
    <TotalDeficiencies>15</TotalDeficiencies>
  </Summary>
</CMSFacilitySubmission>
```

---

## Error Handling

All errors follow this standard format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Code | Meaning | Common Cause |
|------|---------|-------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid input (validation failed) |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions for this action |
| 404 | Not Found | Facility or submission not found |
| 500 | Server Error | Unexpected server error |

---

## Usage Workflow Example

```bash
# 1. Validate facility data
curl -X POST http://localhost:8001/api/v1/cms/validate/facility-123 \
  -H "Authorization: Bearer TOKEN"

# 2. If valid, export data for review
curl -X POST http://localhost:8001/api/v1/cms/export/facility-123 \
  -H "Authorization: Bearer TOKEN" \
  -d '{"format": "json"}'

# 3. Submit to CMS
curl -X POST http://localhost:8001/api/v1/cms/submit/facility-123 \
  -H "Authorization: Bearer TOKEN" \
  -d '{"submission_type": "facility_data"}'

# 4. Check status
curl -X GET http://localhost:8001/api/v1/cms/submissions \
  -H "Authorization: Bearer TOKEN"

# 5. If needed, retry failed submission
curl -X POST http://localhost:8001/api/v1/cms/submissions/sub-xxx/retry \
  -H "Authorization: Bearer TOKEN"
```

---

## Integration Testing

Run the test suite:

```bash
python3 -m pytest tests/cms_integration_test.py -v
```

Expected output: 20/20 tests passing

---

## Support

For issues or questions about the CMS API, contact the StarPath development team.
