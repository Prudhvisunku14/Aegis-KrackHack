# AEGIS Grievance Management System - End-to-End Test Plan

## Current System Status
✅ Backend Server: http://localhost:5000 (Running)  
✅ Frontend Server: http://localhost:5173 (Running)  
✅ Database: PostgreSQL connected to `ageis_db`  
✅ Grievance Schema: Synchronized with all controller methods

## Manual Testing Walkthrough

### Test 1: Student Submits a Grievance

**Prerequisites:**
- Open http://localhost:5173 in browser
- Ensure you're logged in as a student user
- Navigate to Dashboard or click "New Grievance" button

**Steps:**
1. Click "Submit Grievance" button
2. Fill in the form:
   - **Title:** "Lab Room Temperature Too High"
   - **Description:** "The lab room (Room 301) is too warm, affecting student comfort"
   - **Category:** Select "Infrastructure" (or available category)
   - **Priority:** Select "Medium"
   - **Location:** "Lab Room 301, Ground Floor"
   - **Anonymous:** Leave unchecked (unless testing anonymous)
3. Click "Submit Grievance"

**Expected Results:**
- ✅ Form submission succeeds (no error)
- ✅ Redirect to "My Grievances" page
- ✅ New grievance appears in the list
- ✅ Shows correct status: "Submitted"
- ✅ Shows correct category and priority

**API Call Verification:**
```javascript
// Actual request sent to backend:
POST /api/grievances
{
  "title": "Lab Room Temperature Too High",
  "description": "The lab room (Room 301) is too warm...",
  "category_id": 2,          // Category ID as integer
  "priority_id": 2,           // Priority ID as integer
  "location": "Lab Room 301, Ground Floor",
  "anonymous": false
}

// Expected Response:
{
  "grievance_id": 3,
  "submitted_by": 1,          // Current user ID (if not anonymous)
  "category_id": 2,
  "priority_id": 2,
  "description": "The lab room (Room 301) is too warm...",
  "location": "Lab Room 301, Ground Floor",
  "status": "submitted",      // Default status
  "created_at": "2025-02-14T...",
  "updated_at": "2025-02-14T..."
}
```

---

### Test 2: View Own Grievances

**Prerequisites:**
- Logged in as student
- At least one grievance submitted

**Steps:**
1. Navigate to "My Grievances" page
2. Observe the grievance list
3. Click on a grievance to view details

**Expected Results:**
- ✅ Grievance list displays all submitted grievances
- ✅ Each grievance shows:
  - Grievance ID (e.g., "#3")
  - Description preview
  - Category name
  - Priority level
  - Status badge (color-coded)
  - Date submitted
- ✅ Click opens details panel showing:
  - Full grievance ID
  - Status
  - Category
  - Priority
  - Location
  - Description
  - Submission type (Registered/Anonymous)

**Database Query Verification:**
```sql
-- Actual query sent to database:
SELECT g.*, gc.category_name, gp.priority_name, u.full_name as reporter_name
FROM grievances g
LEFT JOIN grievance_category gc ON g.category_id = gc.category_id
LEFT JOIN grievance_priority gp ON g.priority_id = gp.priority_id
LEFT JOIN users u ON g.submitted_by = u.user_id
WHERE g.submitted_by = 1  /* Current user */
ORDER BY g.created_at DESC
LIMIT 10

-- Expected result columns:
grievance_id, submitted_by, category_id, priority_id, assigned_to, 
description, location, status, created_at, updated_at,
category_name, priority_name, reporter_name
```

---

### Test 3: Anonymous Submission

**Prerequisites:**
- At least one grievance submitted previously

**Steps:**
1. Go to Submit Grievance page
2. Fill in form as before
3. **Check the "Anonymous" checkbox**
4. Submit

**Expected Results:**
- ✅ Submission succeeds
- ✅ In "My Grievances" list, shows "📝 Submitted anonymously"
- ✅ Details panel shows "Submission Type: Anonymous Submission"
- ✅ `submitted_by` is NULL in database

**Database Verification:**
```sql
-- Check database for anonymous submission:
SELECT grievance_id, submitted_by, description, status FROM grievances 
WHERE grievance_id = 3  -- Or latest grievance ID;

-- Expected: submitted_by column should be NULL for anonymous
```

---

### Test 4: Authority Views and Manages Grievances

**Prerequisites:**
- Logged in as Authority user
- At least two grievances submitted in the system

**Steps:**
1. Navigate to Authority Grievance Dashboard
2. Observe the list of all grievances
3. Click on a grievance to select it
4. View details in right panel
5. Select a department from "Assign Department" dropdown
6. Click "Assign" button
7. Change status to "In Progress" and add remarks
8. Click "Update"

**Expected Results:**
- ✅ Authority dashboard shows all grievances
- ✅ Each grievance displays:
  - ID with # prefix
  - Description preview (first 50 chars)
  - Category
  - Priority (color-coded)
  - Submission type (Registered/Anonymous)
  - Date
- ✅ Details panel shows:
  - Grievance ID
  - Current status
  - Reporter name (or Anonymous)
  - Current assignment status
- ✅ Assignment dropdown updates grievance
- ✅ Status update creates history entry

**API Calls Verification:**

Assign Department:
```javascript
POST /api/authority/assign
{
  "grievance_id": 2,
  "department_id": 1
}
```

Update Status:
```javascript
PUT /api/grievances/2
{
  "status": "in_progress",
  "remarks": "This is being investigated"
}
```

---

### Test 5: Anonymous Grievance Tracking

**Prerequisites:**
- Submit an anonymous grievance (from Test 3)
- Logged in as student who submitted it

**Steps:**
1. Go to "My Grievances"
2. Find the anonymous grievance
3. View its details and track status updates

**Expected Results:**
- ✅ Anonymous grievance appears in student's list
- ✅ Can track status changes without revealing identity
- ✅ Authority can't see who submitted it

---

## Detailed Field Mappings

### Grievance Submission Form → Database

| Form Field | Database Column | Data Type | Required | Notes |
|---|---|---|---|---|
| Title | (not stored) | - | Yes | Used for display preview |
| Description | description | TEXT | Yes | Stored directly |
| Category | category_id | INTEGER (FK) | Yes | Foreign key to grievance_category |
| Priority | priority_id | INTEGER (FK) | Yes | Foreign key to grievance_priority |
| Location | location | VARCHAR | No | Optional location info |
| Anonymous | submitted_by | INTEGER (FK) | No | If checked, submitted_by = NULL |

### Database Response Fields

```json
{
  "grievance_id": 2,              // Primary key
  "submitted_by": 1,              // Foreign key to users (NULL if anonymous)
  "category_id": 3,               // Foreign key to grievance_category
  "priority_id": 2,               // Foreign key to grievance_priority
  "assigned_to": 4,               // Current assignment (can be NULL)
  "description": "...",           // Full text
  "location": "Room 301",         // From form
  "status": "submitted",          // submitted, under_review, in_progress, resolved, closed
  "created_at": "2025-02-14T...", // Timestamp
  "updated_at": "2025-02-14T..."  // Timestamp
}
```

### View Enriched Fields (From Joins)

**With Joins Applied:**
```json
{
  // All fields from above, plus:
  "category_name": "Infrastructure",
  "priority_name": "High",
  "reporter_name": "Dev User"  // Or NULL if anonymous
}
```

---

## Error Scenarios to Test

### Test 6A: Missing Required Fields

**Steps:**
1. Go to Submit Grievance
2. Leave "Description" empty
3. Try to submit

**Expected:** Error message (form validation)

### Test 6B: Invalid Category ID

**Steps:**
1. Open browser DevTools
2. In the form submission, manually change `category_id` to 999
3. Submit

**Expected:** 
- ✅ API returns 400/422 error
- ✅ Error message displayed
- ✅ NOT stored in database

### Test 6C: Unauthorized Access

**Steps:**
1. Log in as Student
2. Try to access Authority endpoints directly (e.g., POST /api/authority/assign)
3. Or try to update another user's grievance

**Expected:**
- ✅ 401/403 Unauthorized error
- ✅ Operation blocked
- ✅ Log entry created

---

## Database State Verification

### Check Grievances Table

```sql
-- List all grievances with details:
SELECT 
  g.grievance_id, 
  g.submitted_by, 
  gc.category_name,
  gp.priority_name,
  g.status,
  u.full_name as reporter,
  g.created_at
FROM grievances g
LEFT JOIN grievance_category gc ON g.category_id = gc.category_id
LEFT JOIN grievance_priority gp ON g.priority_id = gp.priority_id
LEFT JOIN users u ON g.submitted_by = u.user_id
ORDER BY g.created_at DESC;

-- Check anonymous grievances (submitted_by = NULL):
SELECT grievance_id, category_id, status, created_at 
FROM grievances 
WHERE submitted_by IS NULL;

-- Check specific grievance:
SELECT * FROM grievances WHERE grievance_id = 2;
```

---

## Success Criteria

✅ **All Tests Pass When:**
1. Student can submit grievance with all required fields
2. Grievance appears immediately in "My Grievances"
3. Anonymous submissions work and show correctly
4. Authority can view all grievances
5. Authority can assign and update status
6. No database errors (check server.log)
7. All API responses include correct field names
8. No JavaScript errors in console
9. Pagination works (if >10 grievances)
10. Filters work (by status, priority, etc.)

---

## Troubleshooting

If Tests Fail:

1. **Backend not responding:**
   - Check `server.log` for errors
   - Verify database connection
   - Run `node test-grievance-endpoints.js` for schema validation

2. **Frontend shows blank data:**
   - Check browser console for errors
   - Verify API response in Network tab
   - Confirm `VITE_API_BASE` variable is set

3. **Wrong field names in response:**
   - Verify grievance.controller.js has correct column names
   - Re-run `test-grievance-endpoints.js`
   - Check database schema with schema inspection query

4. **403 Unauthorized errors:**
   - Verify you're logged in
   - Check JWT token in localStorage
   - Verify user role is correct (Student, Authority, Admin)

---

## Summary

**Schema Synchronized: ✅**
- Backend uses correct column names (grievance_id, submitted_by, assigned_to)
- Frontend components updated to display correct fields
- Queries tested against actual database
- All CRUD endpoints ready for use

**Ready for Production Testing: ✅**

---
Date: 2025-02-14  
Status: System ready for end-to-end testing
