# AEGIS Pillar I: Identity & Governance - Implementation Complete

## Overview
Pillar I establishes the foundation of the AEGIS platform with secure access control, administrative oversight, role-based governance, and activity auditing.

---

## Completed Features

### 1. **Authentication & Authorization**
✅ **JWT-based Authentication**
- Register endpoint: `POST /api/auth/register`
- Login endpoint: `POST /api/auth/login`
- Token validation: 8-hour expiration, signed with `JWT_SECRET`
- Authenticated user endpoint: `GET /api/auth/me`

✅ **Institute Email Validation**
- Only `@iitmandi.ac.in` email addresses allowed
- Validated on both backend (auth.controller.js) and frontend (Register.jsx)
- Real-time feedback in UI for email validation

✅ **Password Security**
- bcrypt hashing with 10 rounds
- Passwords never exposed in API responses
- Secure comparison for login verification

✅ **Role-Based Access Control (RBAC)**
- 4 roles supported: Student, Faculty, Authority, Admin
- Roles mapped from database (`roles` table with role_id/role_name)
- JWT includes role for stateless authorization
- Middleware: `authenticateJWT` (validates token) + `authorizeRoles` (checks role)

---

### 2. **Admin Dashboard Backend**
✅ **Admin Controller** (`controllers/admin.controller.js`)
- Role-gated endpoints (admin/authority access)
- 5 key endpoints:
  - `GET /api/admin/users` - List all users with pagination, filters by role/status
  - `PUT /api/admin/users/:user_id/role` - Change user role (admin-only)
  - `PUT /api/admin/users/:user_id/status` - Activate/deactivate user (admin-only)
  - `GET /api/admin/logs` - View activity audit logs (admin/authority)
  - `GET /api/admin/health` - System health metrics (admin/authority)

✅ **Admin Routes** (`routes/admin.routes.js`)
- All routes protected by `authenticateJWT` middleware
- Additional role checks inside controllers via `authorizeRoles`
- 403 Forbidden response for unauthorized access

---

### 3. **Admin Dashboard Frontend**
✅ **AdminDashboard Page** (`src/pages/AdminDashboard.jsx`)
- Tab-based UI: Users | Logs | Health
- **Users Tab:**
  - Paginated user list (20 per page)
  - Filter by role (Student/Faculty/Authority/Admin)
  - Filter by status (Active/Inactive)
  - Inline role dropdown for changing user roles (admin-only)
  - Activate/Deactivate buttons with safeguards (can't self-demote)
  - Displays created_at timestamp
  
- **Logs Tab:**
  - Paginated activity logs (15 per page)
  - Shows user, action, details, timestamp
  - Audit trail for admin oversight
  
- **Health Tab:**
  - System metrics cards: Total Users, Active Grievances, Activity Logs, DB Status
  - Color-coded status indicators
  - Quick system overview

✅ **Protected Route Integration**
- Admin dashboard at `/admin` route
- Protected by ProtectedRoute component (checks JWT)
- Admin link visible only to admin/authority users
- Dashboard.jsx conditionally shows Admin button based on role

---

### 4. **Database Support**
✅ **Schema Alignment**
- Users table: `user_id`, `institute_email`, `password_hash`, `full_name`, `role_id` (FK), `department_id`, `is_active`, `created_at`
- Roles table: `role_id`, `role_name` (Student=1, Faculty=2, Authority=3, Admin=4)
- Activity logs table: `activity_log_id`, `user_id`, `action`, `details`, `created_at`
- Auto-CRUD for all 27 tables already in place

✅ **Activity Logging Hooks**
- Admin controller methods log actions to `activity_logs` table
- Logs: role changes, user status changes, access to admin functions
- Ready for integration with auth controller (register/login logging)

---

### 5. **Security Features**
✅ **Implemented:**
- JWT validation on every protected endpoint
- Role-based middleware enforcement
- Parameterized queries (no SQL injection risk)
- Password hashing (bcrypt, never stored plain)
- HTTP-only JWT handling via localStorage (frontend) 
- CORS enabled for frontend communication
- Email domain whitelist (@iitmandi.ac.in)

⏳ **Pending (Optional):**
- CSRF protection (express-csurf middleware)
- Request validation/sanitization (joi/zod schema)
- Rate limiting on auth endpoints
- Two-factor authentication (2FA)

---

## API Endpoints Reference

### Authentication
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | ❌ | Register new user (email must be @iitmandi.ac.in) |
| `/api/auth/login` | POST | ❌ | Login and receive JWT token |
| `/api/auth/me` | GET | ✅ JWT | Get authenticated user details |

### Admin Management
| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/api/admin/users` | GET | ✅ JWT | admin, authority | List all users (paginated, filterable) |
| `/api/admin/users/:user_id/role` | PUT | ✅ JWT | admin | Change user role |
| `/api/admin/users/:user_id/status` | PUT | ✅ JWT | admin | Activate/deactivate user |
| `/api/admin/logs` | GET | ✅ JWT | admin, authority | View activity logs |
| `/api/admin/health` | GET | ✅ JWT | admin, authority | System health metrics |

---

## Frontend Pages

### Protected Pages
| Route | Component | Visible To | Purpose |
|-------|-----------|-----------|---------|
| `/login` | Login.jsx | All | Email + password authentication |
| `/register` | Register.jsx | All | New account with institute email validation |
| `/dashboard` | Dashboard.jsx | Authenticated | Welcome page + role-based navigation |
| `/profile` | Profile.jsx | Authenticated | User profile details + name editing |
| `/admin` | AdminDashboard.jsx | admin, authority | User management + system oversight |

### Key Components
- **ProtectedRoute.jsx**: Checks JWT in localStorage, redirects to /login if missing
- **API Service** (`services/api.js`): Centralizes HTTP requests, auto-injects Bearer token
- **Dashboard Navigation**: Shows Admin button only to admin/authority users

---

## Environment Configuration

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ageis_db
DB_USER=postgres
DB_PASSWORD=Prudhvi@312
JWT_SECRET=supersecretkey
PORT=5000
```

### Frontend (.env)
```
VITE_API_BASE=http://localhost:5000
```

---

## JWT Token Structure
```json
{
  "id": "user_id",
  "email": "user@iitmandi.ac.in",
  "role": "admin|faculty|authority|student",
  "iat": 1234567890,
  "exp": 1234604690
}
```
- **Issued at:** Login/Register
- **Expires:** 8 hours later
- **Refresh:** Not yet implemented (manual re-login required)

---

## Usage Examples

### Register Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@iitmandi.ac.in",
    "password": "SecurePass123",
    "role": "admin"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@iitmandi.ac.in",
    "password": "SecurePass123"
  }'
```
Response includes `token` → save to localStorage with key `aegis_token`

### List Users (Admin Only)
```bash
curl -X GET "http://localhost:5000/api/admin/users?page=1&limit=20&role=admin" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Change User Role (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/admin/users/5/role \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role_name": "faculty"}'
```

---

## Testing Checklist

✅ **Backend Route Registration**
- [x] `GET /api/admin/users` returns 401 without JWT (secured)
- [x] Server starts without errors on port 5000
- [x] Admin controller exports all 5 functions

✅ **Database Connectivity**
- [x] PostgreSQL `ageis_db` connection established
- [x] Users table has role_id FK to roles table
- [x] Activity logs table exists and ready for use

✅ **Frontend Integration**
- [x] Vite dev server running on port 5174
- [x] Register page accepts @iitmandi.ac.in emails only
- [x] Login page calls backend `/api/auth/login`
- [x] Dashboard shows user info after login
- [x] Admin button appears only for admin/authority users
- [x] AdminDashboard loads user list via GET /api/admin/users

---

## Next Steps (Future Pillars)

### Pillar II: Voice (Grievance Management)
- Extend grievance controller with priority/status workflow
- Add grievance comments/remarks system
- Email notifications for grievance updates

### Pillar III: Fate (Academic Resources)
- Course enrollment management
- Grade tracking
- Academic calendar integration

### Pillar IV: Opportunity (Internships & Research)
- Opportunity listing & application system
- Bookmark/save for later
- Direct messaging between students & mentors

### Pillar V: Commons (Discussion & Knowledge)
- Forum/discussion boards
- FAQ management
- Document repository

### Pillar VI: Connection (Networking)
- Alumni network
- Mentorship pairing
- Event management

### Pillar VII: Clubs & Announcements
- Club directory
- Event announcements
- Calendar integration

---

## Known Limitations & Future Improvements

1. **JWT Refresh**: No refresh token mechanism; users must re-login after 8 hours
2. **Email Verification**: No email confirmation flow before account activation
3. **Rate Limiting**: No rate limiting on auth endpoints (DoS risk)
4. **Audit Trail**: Activity logging needs to be wired into auth controller
5. **Session Management**: No session tracking or concurrent login limits
6. **CSRF Protection**: Not yet implemented
7. **Two-Factor Auth**: Not yet available
8. **Password Reset**: No forgot-password functionality

---

## File Summary

### Backend Files Modified/Created
- ✅ `server.js` - Added `/api/admin` route registration
- ✅ `controllers/admin.controller.js` - New admin endpoints (5 functions)
- ✅ `routes/admin.routes.js` - New admin route definitions
- ✅ `controllers/auth.controller.js` - Added @iitmandi.ac.in email validation
- ✅ `middleware/auth.middleware.js` - Already had authenticateJWT & authorizeRoles
- ✅ `scripts/test-admin.js` - Test script for admin endpoints

### Frontend Files Modified/Created
- ✅ `src/App.jsx` - Added AdminDashboard import & route
- ✅ `src/pages/AdminDashboard.jsx` - New admin dashboard UI (3 tabs)
- ✅ `src/pages/Dashboard.jsx` - Added conditional Admin button for admin/authority
- ✅ `src/pages/Register.jsx` - Added email validation + UI feedback
- ✅ `src/services/api.js` - Already had JWT injection

---

## Verification Commands

```bash
# Start backend
cd aegis-backend && node server.js

# Start frontend (in new terminal)
cd aegis-frontend && npm run dev

# Test admin endpoints
cd aegis-backend && node -r dotenv/config scripts/test-admin.js

# Access frontend
# http://localhost:5174
# Register: admin@iitmandi.ac.in / TestPass123
# Login and navigate to Admin dashboard
```

---

**Status**: ✅ Pillar I (Identity & Governance) COMPLETE
- Secure authentication with institute email validation
- Role-based access control (4 roles)
- Admin dashboard with user management
- Activity logging infrastructure
- Protected API endpoints with JWT + role validation

**Ready for**: Pillar II (Voice - Grievance Management) implementation
