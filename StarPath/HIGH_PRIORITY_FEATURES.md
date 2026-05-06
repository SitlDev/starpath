# StarPath SNF - High-Priority Features Implementation Guide

## 🎯 Features Implemented

### 1. Role-Based Access Control (RBAC) ✅
### 2. Export/Reporting - PDF Generation ✅
### 3. Real-time Notifications - WebSocket ✅

---

## 📋 Database Setup

Run migrations to add new fields:

```bash
cd starpath-backend
alembic revision --autogenerate -m "Add roles and notifications"
alembic upgrade head
```

This will create:
- `role` field on `users` table (ENUM: admin, facility_manager, auditor)
- `password_reset_token` and `password_reset_token_expires` fields
- Complete `notifications` table with user_id, type, title, message, is_read, etc.

---

## 🔐 1. Role-Based Access Control (RBAC)

### Roles Defined

**ADMIN**
- ✅ View dashboard, facilities, ratings, inspections
- ✅ Edit facilities, create inspections
- ✅ Download reports, export data
- ✅ Delete facilities
- ✅ Manage users & roles
- ✅ Manage system settings

**FACILITY_MANAGER**
- ✅ View dashboard, facilities, ratings, inspections
- ✅ Edit their facilities
- ✅ Create health inspections
- ✅ Download reports & export data
- ❌ Cannot delete facilities or manage other users

**AUDITOR**
- ✅ View dashboard, facilities, ratings, inspections
- ✅ Download reports
- ❌ Cannot edit or create data
- ❌ Cannot export data
- ❌ Read-only access

### Backend Endpoints

**Get User Permissions**
```bash
GET /api/v1/users/me/permissions

Returns: {
  "view_dashboard": true,
  "view_facilities": true,
  "edit_facilities": true/false (based on role),
  "download_reports": true,
  "export_data": true/false,
  "manage_users": true/false (admin only),
  ...
}
```

**Assign Role (Admin Only)**
```bash
PATCH /api/v1/users/{user_id}/role?new_role=facility_manager

Body: {
  "new_role": "admin|facility_manager|auditor"
}

Returns: {"message": "User role updated to facility_manager"}
```

**List Users (Admin Only)**
```bash
GET /api/v1/users?skip=0&limit=100

Returns: [{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "facility_manager",
  "is_active": true,
  "created_at": "2024-05-06T..."
}]
```

### Usage in Code

```python
# In FastAPI routes
from app.utils.rbac import require_admin, require_facility_manager

@router.post("/facilities")
async def create_facility(
    facility_data: FacilityCreate,
    current_user: UserModel = Depends(require_facility_manager),  # Only FM+
    db: Session = Depends(get_db)
):
    # Code here only runs if user is FACILITY_MANAGER or ADMIN
    ...

@router.delete("/facilities/{id}")
async def delete_facility(
    facility_id: str,
    current_user: UserModel = Depends(require_admin),  # Admin only
    db: Session = Depends(get_db)
):
    # Code here only runs if user is ADMIN
    ...
```

### Frontend Implementation

```typescript
// Get user permissions
const response = await fetch('/api/v1/users/me/permissions', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const permissions = await response.json()

// Show/hide features based on role
{permissions.manage_users && (
  <Link href="/admin/users">Manage Users</Link>
)}

{permissions.export_data && (
  <button onClick={exportData}>Export to CSV</button>
)}
```

---

## 📊 2. Export/Reporting - PDF Generation

### PDF Report Types

**1. Comprehensive Facility Report**
- Facility information (name, beds, CMS ID, address, ownership)
- Latest star ratings (overall, health inspection, staffing, QM)
- Recent inspections (date, type, deficiencies, status)
- Professional PDF layout with branding
- Print-ready format

**2. Ratings Trend Analysis**
- Historical ratings over 12-24 months
- Trend indicators (improving, declining, stable)
- Date-by-date comparison
- Performance analysis

### Backend Endpoints

**Download Facility Report**
```bash
GET /api/v1/reports/facility/{facility_id}

Returns: PDF file download
Filename: {facility_name}_Report_20240506.pdf
```

**Download Ratings Trend Report**
```bash
GET /api/v1/reports/ratings-trend/{facility_id}

Returns: PDF file download
Filename: {facility_name}_Ratings_Trend_20240506.pdf
```

### Report Generator Service

```python
# app/services/report_generator.py
from app.services.report_generator import ReportGenerator

# Create facility report
generator = ReportGenerator("Facility Report")
pdf_buffer = generator.generate_facility_report(
    facility_name="Care Center",
    facility_data={...},
    ratings_data=[...],
    inspections_data=[...]
)

# Create trend report
pdf_buffer = generator.generate_ratings_trend_report(
    facility_name="Care Center",
    ratings_history=[...]
)
```

### Frontend Reports Page

Navigate to: `http://localhost:3000/dashboard/reports`

**Features:**
- ✅ Facility dropdown selector
- ✅ Two report types with descriptions
- ✅ One-click download buttons
- ✅ Professional UI with icons
- ✅ Information section explaining reports

### Integration with Inspections

When a new inspection is uploaded, automatically:
1. Generate inspection summary PDF
2. Store in database
3. Make available for download
4. Notify users via WebSocket

---

## 🔔 3. Real-time Notifications - WebSocket

### Notification Types

**NEW_INSPECTION**
- Triggered when new inspection is added
- Message: "New health inspection for [Facility Name]"
- Data: inspection_id, facility_id

**RATING_CHANGE**
- Triggered when rating is updated
- Message: "Star rating updated for [Facility Name]"
- Data: new_rating, facility_id, change_percent

**LOW_RATING_ALERT**
- Triggered when facility rating drops ≤ 2 stars
- Message: "[Facility Name] rating dropped to [rating] stars"
- Data: facility_id, current_rating

**SYSTEM_MESSAGE**
- Admin messages, maintenance notices, role changes
- Custom title and message

**REPORT_READY**
- When PDF report is generated
- Message: "Your [Report Type] report is ready for download"
- Data: report_id, facility_id

### Backend Setup

**WebSocket Connection**
```bash
WS /api/v1/ws/{user_id}

Establishes persistent connection for real-time updates
Automatically reconnects with exponential backoff
```

**Send Notification to User**
```python
from app.services.websocket_manager import manager

await manager.send_personal_message(user_id, {
    "type": "rating_change",
    "title": "Star Rating Updated",
    "message": "Oak Care Center rating changed to 4.5 stars",
    "data": {
        "facility_id": "...",
        "new_rating": 4.5
    }
})
```

**Send Notification to Multiple Users**
```python
await manager.send_to_multiple_users(user_ids, message)
```

**Broadcast to All Connected Users**
```python
await manager.broadcast(message)
```

### Frontend WebSocket Hook

```typescript
import { useWebSocket } from '@/lib/useWebSocket'

// Use in any component
useWebSocket({
  onNotification: (notification) => {
    console.log('📢 New notification:', notification.title)
    // Show toast, update UI, play sound, etc.
  }
})
```

### Notification Center Component

**Location:** Sidebar (bell icon with badge showing unread count)

**Features:**
- ✅ Real-time notification panel
- ✅ Unread count badge
- ✅ Mark as read/unread
- ✅ Delete individual notifications
- ✅ Mark all as read
- ✅ Type-specific icons
- ✅ Relative timestamps
- ✅ Click-through to related facility/report

### Notification API Endpoints

**Get Notifications**
```bash
GET /api/v1/notifications?skip=0&limit=50&unread_only=false

Returns: [{
  "id": "uuid",
  "type": "rating_change",
  "title": "Star Rating Updated",
  "message": "Oak Care Center rating changed to 4.5",
  "data": {...},
  "is_read": false,
  "created_at": "2024-05-06T..."
}]
```

**Get Unread Count**
```bash
GET /api/v1/notifications/unread-count

Returns: {"unread_count": 3}
```

**Mark as Read**
```bash
PATCH /api/v1/notifications/{notification_id}

Body: {"is_read": true}
```

**Mark All as Read**
```bash
POST /api/v1/notifications/mark-all-read

Returns: {"message": "All notifications marked as read"}
```

**Delete Notification**
```bash
DELETE /api/v1/notifications/{notification_id}

Returns: {"message": "Notification deleted"}
```

### Emit Notifications from Business Logic

**When Health Inspection is Created**
```python
from app.models.notification import Notification, NotificationType

notification = Notification(
    user_id=facility_manager_id,
    type=NotificationType.NEW_INSPECTION,
    title="New Health Inspection",
    message=f"New inspection for {facility.name}",
    facility_id=facility.id
)
db.add(notification)
db.commit()

# Notify via WebSocket if user connected
await manager.send_personal_message(str(facility_manager_id), {
    "type": "new_inspection",
    "title": "New Health Inspection",
    "message": f"New inspection for {facility.name}",
    "facility_id": str(facility.id)
})
```

---

## 🚀 Deployment Checklist

### Backend
- [ ] Install new dependencies: `pip install -r requirements.txt`
- [ ] Run migrations: `alembic upgrade head`
- [ ] Set environment variables (RESEND_API_KEY already set)
- [ ] Restart FastAPI server
- [ ] Test WebSocket connection at `/api/v1/ws/test-user-id`

### Frontend
- [ ] Run `npm install` (or `npm update`)
- [ ] Test NotificationCenter component renders
- [ ] Test PDF download flow
- [ ] Test WebSocket connection in browser DevTools
- [ ] Build for production: `npm run build`

### Database
- [ ] Backup production database
- [ ] Run migrations on production
- [ ] Verify new tables exist: `users.role`, `notifications`

---

## 🧪 Testing Scenarios

### RBAC Testing
1. Create three users with different roles
2. Login as each role
3. Verify features shown/hidden correctly
4. Verify API endpoints enforce permissions

### Reporting Testing
1. Navigate to `/dashboard/reports`
2. Select a facility
3. Download both report types
4. Verify PDFs are properly formatted
5. Verify file names include dates

### WebSocket Testing
1. Open two browser windows
2. Login with same user in both
3. In one window, create new inspection
4. Verify notification appears in both windows within 1 second
5. Test mark as read, delete, mark all as read
6. Disconnect and verify reconnection with exponential backoff

---

## 📱 Architecture Diagram

```
┌─ USERS (with roles) ──┐
│  - admin               │
│  - facility_manager    │
│  - auditor             │
└───────────────────────┘
         ↓
    RBAC Middleware
    (require_admin, etc.)
         ↓
    Protected Endpoints
    (facilities, ratings, etc.)

┌─ NOTIFICATIONS ──────┐
│  - type              │
│  - user_id           │
│  - is_read           │
│  - created_at        │
└─────────────────────┘
         ↓
    WebSocket Manager
    (send_personal_message, etc.)
         ↓
    Frontend NotificationCenter
    (real-time UI updates)

┌─ PDF REPORTS ─────────────┐
│  - Facility Report         │
│  - Ratings Trend Report    │
│  - Generated on-demand     │
└────────────────────────────┘
         ↓
    ReportGenerator Service
         ↓
    User Download
```

---

## 📞 Support

For issues or questions:
1. Check WebSocket connection in browser DevTools
2. Verify migrations ran successfully
3. Check backend logs for errors
4. Verify user roles are properly set in database

