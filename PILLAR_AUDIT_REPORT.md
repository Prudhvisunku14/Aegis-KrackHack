# AEGIS PLATFORM - PILLAR I-IV COMPREHENSIVE AUDIT REPORT

**Generated:** February 15, 2026  
**Status:** ACTIVE DEPLOYMENT  
**URL:** https://aegis-krackhack.onrender.com

---

## EXECUTIVE SUMMARY

| Pillar | Name | Completion | Status | Grade |
|--------|------|-----------|--------|-------|
| **I** | Identity & Governance | 85% | ✅ Operational | A- |
| **II** | Voice (Grievances) | 80% | ✅ Operational | A- |
| **III** | Fate (Academic Mastery) | 70% | ✅ Operational | B+ |
| **IV** | Opportunity | 75% | ✅ Operational | B+ |

**Overall:** **77.5% Complete** - Strong Foundation with Room for Enhancement

---

## PILLAR I: IDENTITY & GOVERNANCE
### (The Iron Gate, High Command Dashboard & The Aegis Security)

### ✅ IMPLEMENTED FEATURES

#### Authentication System
- [x] **Role-based authentication** - Student, Faculty, Authority, Admin
- [x] **Institute email validation** - @aegis.edu enforced
- [x] **Bcrypt password hashing** - Secure storage
- [x] **JWT token generation** - Stateless auth
- [x] **Token expiration** - Configurable
- [x] **Protected routes** - ProtectedRoute component
- [x] **Login/Register pages** - Full UI with validation

#### Admin Dashboard
- [x] **System analytics** - User counts, opportunity stats
- [x] **User management interface** - View, filter users
- [x] **Activity logs** - Track user actions
- [x] **Role assignment** - View user roles and departments
- [x] **Grievance management** - Overview and status updates
- [x] **Opportunity management** - Create, edit, delete opportunities
- [x] **Resource management** - Browse academic resources with search/filter
- [x] **System monitoring** - Database health checks

#### Security Implementation
- [x] **RBAC** - Role checks in controllers
- [x] **SQL Injection protection** - Parameterized queries
- [x] **XSS protection** - React escaping
- [x] **CORS** - Enabled and configured
- [x] **Session management** - JWT + refresh tokens
- [x] **Password requirements** - Hash validation

### ❌ MISSING/INCOMPLETE FEATURES

| Feature | Priority | Impact | Recommendation |
|---------|----------|--------|----------------|
| **Multi-factor authentication (MFA)** | High | Accounts could be compromised | Implement TOTP/SMS 2FA |
| **Comprehensive audit trail** | High | Limited accountability | Log all admin actions with timestamps |
| **User activity analytics** | Medium | Limited insights | Dashboard showing user engagement metrics |
| **Session invalidation on logout** | High | Security risk | Implement token blacklist/revocation |
| **Password reset functionality** | High | Users lose access | Email-based password recovery |
| **Account lockout after failed attempts** | High | Brute force vulnerability | Lock after 5 attempts for 15 mins |
| **Role-based dashboard customization** | Medium | All see same view | Tailor admin dashboard per role |
| **API rate limiting** | Medium | DDoS vulnerability | Implement express-rate-limit |

### 📊 DETAILED ASSESSMENT

**Strengths:**
- Clean authentication flow with proper validation
- Clear role hierarchy implemented
- JWT properly used for stateless auth
- Protected routes prevent unauthorized access
- Admin dashboard has good feature coverage

**Weaknesses:**
- Missing session blacklist (logout not truly effective)
- No account lockout mechanism
- Limited audit logging (only basic activity logs)
- No MFA support
- No password reset flow
- No rate limiting on auth endpoints

### 🔧 IMPROVEMENT SUGGESTIONS

```javascript
// 1. Add Token Blacklist for Logout
// backend/utils/tokenBlacklist.js
const tokenBlacklist = new Set();

function blacklistToken(token) {
  tokenBlacklist.add(token);
}

function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

// 2. Implement Account Lockout
// In auth.controller.js - track failed attempts
const failedAttempts = new Map();

function checkAccountLock(email) {
  const attempts = failedAttempts.get(email) || { count: 0, lockedUntil: null };
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return { locked: true, until: attempts.lockedUntil };
  }
  return { locked: false };
}

// 3. Add Password Reset Handler
router.post('/password-reset-request', async (req, res) => {
  const { email } = req.body;
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  await db.query(
    'UPDATE users SET password_reset_token = $1, password_reset_expires = NOW() + INTERVAL \'1 hour\' WHERE institute_email = $2',
    [hashedToken, email]
  );
  
  // Send email with resetToken
  sendPasswordResetEmail(email, resetToken);
  res.json({ message: 'Reset link sent to email' });
});
```

---

## PILLAR II: VOICE (GRIEVANCE MANAGEMENT)
### (The Silent Scroll, The Watcher's Eye & Automated Intelligence)

### ✅ IMPLEMENTED FEATURES

#### Issue Submission Portal
- [x] **Anonymous/identified submission** - Toggle optional
- [x] **Categorization system** - Infrastructure, Academics, Hostel, Food, Other
- [x] **Priority tagging** - Low, Medium, High, Urgent
- [x] **Location tagging** - Free text input
- [x] **Photo upload** - File upload capability
- [x] **Submission history** - Students can view own grievances

#### Tracking Dashboard
- [x] **Status tracking** - Submitted, Under Review, In Progress, Resolved
- [x] **Authority remarks** - Visible to submitters
- [x] **Timeline view** - Shows status progression
- [x] **Filter/search** - By category, status, date, priority
- [x] **Student grievance view** - Track submitted issues

#### Administrative Interface
- [x] **Issue assignment** - Assign to departments
- [x] **Status updates** - Change grievance status
- [x] **Remarks/notes** - Add resolution details
- [x] **Dashboard** - Admin view of all grievances
- [x] **Authority dashboard** - Department-specific view

### ❌ MISSING/INCOMPLETE FEATURES

| Feature | Priority | Impact | Recommendation |
|---------|----------|--------|----------------|
| **Automated email summaries** | High | Departments miss updates | Cron job + nodemailer |
| **High-priority alerts** | High | Critical issues ignored | Alert after 72+ hours |
| **Analytics dashboard** | Medium | No visibility into patterns | Timeline, category breakdown charts |
| **Attachment management** | Medium | Images not organized | Store, retrieve, display in detail view |
| **Grievance escalation** | Medium | Important issues get lost | Auto-escalate when no action 48h |
| **Multiple assignment** | Low | Single point of failure | Allow multi-department assignment |
| **SLA tracking** | High | No accountability | Show expected resolution time |
| **Related grievances linking** | Low | Duplicates not grouped | Allow merging similar issues |
| **Notification system** | High | Users don't know status changed | Email/SMS when status updates |
| **Grievance history export** | Low | No record keeping | Export as CSV/PDF |

### 📊 DETAILED ASSESSMENT

**Strengths:**
- Complete submission workflow
- Good status tracking UI
- Multiple filter options
- Authority dashboard functional
- File upload working

**Weaknesses:**
- No automated notifications
- Missing SLA/deadline tracking
- No analytics/insights
- No escalation automation
- Missing email summaries
- No duplicate detection
- Limited grievance detail view

### 🔧 IMPROVEMENT SUGGESTIONS

```javascript
// 1. Automated Email Summary (Cron Job)
// backend/jobs/emailSummary.js
const cron = require('node-cron');
const nodemailer = require('nodemailer');

cron.schedule('0 9 * * *', async () => {
  // Daily at 9 AM
  const newGrievances = await db.query(`
    SELECT * FROM grievances 
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY department_id
  `);
  
  newGrievances.rows.forEach(async (dept) => {
    const deptHeadEmail = await getDepartmentHeadEmail(dept.department_id);
    const count = await db.query(
      'SELECT COUNT(*) FROM grievances WHERE department_id = $1 AND status = $2',
      [dept.department_id, 'Submitted']
    );
    
    sendSummaryEmail(deptHeadEmail, {
      newCount: count.rows[0].count,
      date: new Date().toDateString()
    });
  });
});

// 2. Auto-Escalation Alert
// backend/jobs/escalationAlert.js
cron.schedule('0 */6 * * *', async () => {
  // Every 6 hours
  const staleGrievances = await db.query(`
    SELECT * FROM grievances 
    WHERE status != 'Resolved' 
    AND updated_at < NOW() - INTERVAL '72 hours'
  `);
  
  staleGrievances.rows.forEach(async (grievance) => {
    await db.query(
      'UPDATE grievances SET priority = $1 WHERE grievance_id = $2',
      [escalatePriority(grievance.priority_id), grievance.grievance_id]
    );
    
    sendAlertEmail(getAuthorityEmail(grievance.assigned_to), {
      grievanceId: grievance.grievance_id,
      daysPending: Math.floor((Date.now() - grievance.updated_at) / (1000*60*60*24))
    });
  });
});

// 3. Analytics Dashboard Data
router.get('/api/authority/grievance-analytics', async (req, res) => {
  const { department_id } = req.query;
  
  const stats = await db.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'Resolved' THEN 1 END) as resolved,
      COUNT(CASE WHEN status = 'Submitted' THEN 1 END) as pending,
      AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600)::int as avg_resolution_hours,
      category_name, 
      COUNT(*) as count
    FROM grievances g
    JOIN grievance_category gc ON g.category_id = gc.category_id
    WHERE g.department_id = $1
    GROUP BY category_name
  `, [department_id]);
  
  res.json(stats.rows);
});

// 4. Notification System (Room 5 DB update)
const buildNotificationQuery = (type, grievanceId, status) => {
  return {
    user_id: grievance.submitted_by,
    type: `grievance_${type}`,
    title: `Your grievance status: ${status}`,
    message: `Grievance #${grievanceId} has been ${status.toLowerCase()}`,
    read: false,
    created_at: new Date()
  };
};
```

**Frontend Component:**
```jsx
// frontend/src/components/GrievanceDetailView.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function GrievanceDetail({ grievanceId }) {
  const [grievance, setGrievance] = useState(null);
  
  useEffect(() => {
    // Subscribe to real-time updates
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_BASE}/api/grievances/${grievanceId}/stream`
    );
    
    eventSource.onmessage = (event) => {
      setGrievance(JSON.parse(event.data));
    };
    
    return () => eventSource.close();
  }, [grievanceId]);
  
  if (!grievance) return <div>Loading...</div>;
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold">Grievance #{grievance.grievance_id}</h2>
        <p className="text-sm opacity-90">Status: {grievance.status}</p>
      </div>
      
      <div className="border-l-4 border-indigo-500 pl-6">
        <div className="relative">
          {grievance.timeline && grievance.timeline.map((event, idx) => (
            <div key={idx} className="mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full -ml-8 mt-1.5"></div>
                <span className="ml-4 font-semibold text-gray-700">{event.new_status}</span>
              </div>
              <p className="text-sm text-gray-600">{event.changed_at}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## PILLAR III: FATE (ACADEMIC MASTERY)
### (The Destiny Manager, The Vault of Knowledge & Chronos Calendar)

### ✅ IMPLEMENTED FEATURES

#### Course Management
- [x] **Enrollment tracking** - View registered courses
- [x] **Course list display** - Courses by semester
- [x] **Course details** - Code, name, credits visible
- [x] **Student dashboard** - Show enrolled courses
- [x] **Faculty assignment** - Faculty linked to courses

#### Resource Repository (Vault of Knowledge)
- [x] **Resource listing** - Show all resources
- [x] **Search functionality** - Search by title
- [x] **Tagging system** - Resources tagged (Python, Web Dev, etc.)
- [x] **Tag filtering** - Filter by tags
- [x] **File links** - Download/access links provided
- [x] **Admin upload** - Add resources to vault

#### Academic Calendar (Chronos Calendar)
- [x] **Calendar display** - Month/week view
- [x] **Event listing** - Show academic events
- [x] **Course filters** - Filter events by course
- [x] **Event details** - View event information
- [x] **Basic reminders** - Show upcoming events

### ❌ MISSING/INCOMPLETE FEATURES

| Feature | Priority | Impact | Recommendation |
|---------|----------|--------|----------------|
| **Credit calculator** | High | Students don't know standing | Show credit breakdown by type |
| **Attendance self-tracker** | High | Manual attendance tracking missing | Add attendance log per course |
| **Previous year papers** | High | Major resource gap | Categorize resources by exam type |
| **Study materials upload** | Medium | Students can't contribute | Student upload functionality |
| **Resource download tracking** | Low | No analytics | Track which resources are used |
| **Personalized reminders** | Medium | Generic calendar | Email/SMS reminders 24h before |
| **GPA/Performance tracking** | High | No academic monitoring | Show grades, calculate GPA |
| **Course prerequisites display** | Medium | Students take wrong courses | Show prerequisites on course cards |
| **Exam schedule integration** | High | Exams not in calendar | Fetch exam dates from academic_events |
| **Attendance percentage** | High | Can't track own attendance | Calculate % per course |
| **Assignment deadlines** | Low | Not tracked separately | Sync with course management |
| **Resource quality ratings** | Low | Can't gauge usefulness | Rate resources 1-5 stars |

### 📊 DETAILED ASSESSMENT

**Strengths:**
- Calendar UI functional
- Resource search working
- Tag-based filtering effective
- Course enrollment visible
- Good resource organization

**Weaknesses:**
- No credit calculator
- No attendance tracking by user
- Previous year papers not organized
- No GPA/performance metrics
- No email reminders
- No student contribution system
- Missing exam schedule integration
- No performance analytics

### 🔧 IMPROVEMENT SUGGESTIONS

```javascript
// 1. Credit Calculator
// frontend/src/components/CreditCalculator.jsx
export default function CreditCalculator({ enrollments }) {
  const [credits, setCredits] = useState({
    total: 0,
    major: 0,
    minor: 0,
    elective: 0
  });
  
  useEffect(() => {
    const calculateCredits = () => {
      const calc = { total: 0, major: 0, minor: 0, elective: 0 };
      
      enrollments.forEach(e => {
        calc.total += e.course.credits;
        
        if (e.course.course_code.includes('MAJOR')) {
          calc.major += e.course.credits;
        } else if (e.course.course_code.includes('MINOR')) {
          calc.minor += e.course.credits;
        } else {
          calc.elective += e.course.credits;
        }
      });
      
      setCredits(calc);
    };
    
    calculateCredits();
  }, [enrollments]);
  
  return (
    <div className="grid grid-cols-4 gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-600">Total Credits</p>
        <p className="text-2xl font-bold text-indigo-600">{credits.total}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-600">Major</p>
        <p className="text-2xl font-bold text-blue-600">{credits.major}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-600">Minor</p>
        <p className="text-2xl font-bold text-green-600">{credits.minor}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-600">Elective</p>
        <p className="text-2xl font-bold text-purple-600">{credits.elective}</p>
      </div>
    </div>
  );
}

// 2. Attendance Tracker
// backend/routes/attendance.routes.js
router.post('/api/attendance/log', authenticateToken, async (req, res) => {
  const { course_id, date, present } = req.body;
  const user_id = req.user.user_id;
  
  await db.query(
    'INSERT INTO attendance_logs (student_id, course_id, date, present) VALUES ($1, $2, $3, $4)',
    [user_id, course_id, date, present]
  );
  
  res.json({ message: 'Attendance logged' });
});

router.get('/api/attendance/summary', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  
  const summary = await db.query(`
    SELECT 
      c.course_code,
      c.course_name,
      COUNT(*) as total_classes,
      COUNT(CASE WHEN present THEN 1 END) as attended,
      ROUND(100.0 * COUNT(CASE WHEN present THEN 1 END) / COUNT(*), 2) as attendance_percent
    FROM attendance_logs al
    JOIN courses c ON al.course_id = c.course_id
    WHERE al.student_id = $1
    GROUP BY c.course_id, c.course_code, c.course_name
  `, [user_id]);
  
  res.json(summary.rows);
});

// 3. GPA & Performance Tracker
router.get('/api/academics/performance', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  
  const performance = await db.query(`
    SELECT 
      c.course_code,
      c.course_name,
      c.credits,
      g.grade,
      (CASE 
        WHEN g.grade = 'A+' THEN 4.0
        WHEN g.grade = 'A' THEN 3.7
        WHEN g.grade = 'B+' THEN 3.3
        WHEN g.grade = 'B' THEN 3.0
        ELSE 0
      END) as grade_point
    FROM grades g
    JOIN courses c ON g.course_id = c.course_id
    WHERE g.student_id = $1
  `, [user_id]);
  
  const courses = performance.rows;
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const gpa = (courses.reduce((sum, c) => sum + (c.grade_point * c.credits), 0) / totalCredits).toFixed(2);
  
  res.json({
    gpa,
    courses,
    totalCredits,
    averageGrade: calculateAverageGrade(courses)
  });
});

// 4. Exam Schedule in Calendar
router.get('/api/calendar/exams', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  
  const exams = await db.query(`
    SELECT 
      ae.event_id,
      ae.title,
      ae.description,
      ae.event_date,
      c.course_code,
      c.course_name
    FROM academic_events ae
    JOIN enrollments e ON ae.course_id = e.course_id
    JOIN courses c ON ae.course_id = c.course_id
    WHERE e.student_id = $1
    AND ae.title ILIKE '%exam%'
    AND ae.event_date >= NOW()
    ORDER BY ae.event_date
  `, [user_id]);
  
  res.json(exams.rows);
});

// 5. Email Reminders (Cron Job)
// backend/jobs/academicReminders.js
cron.schedule('0 8 * * *', async () => {
  const upcoming = await db.query(`
    SELECT DISTINCT 
      u.institute_email,
      ae.event_date,
      ae.title,
      c.course_name
    FROM academic_events ae
    JOIN enrollments e ON ae.course_id = e.course_id
    JOIN users u ON e.student_id = u.user_id
    WHERE ae.event_date = CURRENT_DATE + INTERVAL '1 day'
  `);
  
  upcoming.rows.forEach(event => {
    sendReminderEmail(event.institute_email, {
      title: event.title,
      course: event.course_name,
      date: event.event_date
    });
  });
});
```

---

## PILLAR IV: OPPORTUNITY (INTERNSHIPS & TASKS)
### (The Professor's Call & The Scholar's Ledger)

### ✅ IMPLEMENTED FEATURES

#### Faculty Portal
- [x] **Post opportunities** - Create internship/research posts
- [x] **Required fields** - Title, description, skills, duration, stipend, deadline
- [x] **View applications** - See who applied
- [x] **Application status** - Accept, reject, shortlist
- [x] **Direct messaging** - Chat with applicants
- [x] **Close postings** - Mark opportunity as closed
- [x] **Edit opportunities** - Update posting details
- [x] **Manage posted opportunities** - View all faculty posts

#### Student Portal
- [x] **Browse opportunities** - List all active opportunities
- [x] **Filtering** - Filter by department, skills, deadline
- [x] **Apply to opportunities** - Submit applications
- [x] **Application tracking** - Track application status
- [x] **Bookmark opportunities** - Save for later
- [x] **Browse details** - Full opportunity description
- [x] **Application history** - See past applications
- [x] **Messaging** - Communicate with faculty

#### Scholar's Ledger (Task Manager)
- [x] **Create tasks** - Add personal to-do items
- [x] **Task tracking** - View task status
- [x] **Deadline display** - Show due dates
- [x] **Task management** - Edit/delete tasks
- [x] **Categories** - Organize by type
- [x] **Priority levels** - Set priority
- [x] **Progress tracking** - Visual progress indicators

### ❌ MISSING/INCOMPLETE FEATURES

| Feature | Priority | Impact | Recommendation |
|---------|----------|--------|----------------|
| **Resume upload for applications** | High | Can't see applicant credentials | File upload to applications |
| **Skill-matching algorithm** | High | Manual review tedious | Auto-match students with opps |
| **Application analytics** | Medium | Can't gauge interest | Show apply rate, completion rate |
| **Opportunity recommendations** | Medium | Students miss opportunities | ML-based recommendations |
| **Project milestone tracking** | Medium | Vague progress | Subtasks + milestone dates |
| **Attachment/file sharing** | Medium | Can't exchange documents | File storage in opportunities |
| **Real-time notifications** | High | Applicants miss updates | Push notifications on status change |
| **Interview scheduling** | Low | Managing manually | Built-in calendar integration |
| **Offer letter generation** | Low | Manual process | Auto-generate offer templates |
| **Task reminders** | Medium | Tasks forgotten | Email/SMS on due date |
| **Performance metrics** | Low | Can't gauge effectiveness | Show completion rate, success |
| **Tags/labels for opportunities** | Low | Hard to categorize | Custom tags for filtering |

### 📊 DETAILED ASSESSMENT

**Strengths:**
- Complete opportunity CRUD workflow
- Application tracking functional
- Messaging system working
- Bookmark feature present
- Task manager complete
- Good filtering options
- Faculty/student portal well separated

**Weaknesses:**
- No resume upload with applications
- No skill-matching intelligence
- No recommendation engine
- Missing real-time notifications
- No interview scheduling
- Limited analytics
- No task reminders
- No offer letter generation

### 🔧 IMPROVEMENT SUGGESTIONS

```javascript
// 1. Resume Upload for Applications
// backend/routes/applications.routes.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/resumes/',
  filename: (req, file, cb) => {
    cb(null, `${req.user.user_id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadResume = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents allowed'));
    }
  }
});

router.post('/api/applications/:opportunity_id/apply', 
  authenticateToken, 
  uploadResume.single('resume'), 
  async (req, res) => {
    const application = {
      opportunity_id: req.params.opportunity_id,
      student_id: req.user.user_id,
      resume_path: req.file ? `/uploads/resumes/${req.file.filename}` : null,
      status: 'APPLIED',
      applied_at: new Date()
    };
    
    await db.query(
      'INSERT INTO applications (opportunity_id, student_id, resume_path, status, applied_at) VALUES ($1, $2, $3, $4, $5)',
      [application.opportunity_id, application.student_id, application.resume_path, application.status, application.applied_at]
    );
    
    res.json({ message: 'Application submitted', application });
  }
);

// 2. Skill-Matching Algorithm
// backend/utils/skillMatcher.js
function calculateSkillMatch(studentSkills, requiredSkills) {
  const required = requiredSkills.toLowerCase().split(',').map(s => s.trim());
  const student = studentSkills.toLowerCase().split(',').map(s => s.trim());
  
  const matches = student.filter(skill => 
    required.some(req => req.includes(skill) || skill.includes(req))
  );
  
  return {
    matchedSkills: matches,
    matchPercentage: Math.round((matches.length / required.length) * 100),
    missingSkills: required.filter(skill => !matches.includes(skill))
  };
}

// 3. Recommendations Engine
router.get('/api/opportunities/recommended', authenticateToken, async (req, res) => {
  const { student_id } = req.user;
  
  // Get student's skills from profile/applications
  const studentProfile = await db.query(
    'SELECT skills FROM users WHERE user_id = $1', 
    [student_id]
  );
  
  // Get all open opportunities
  const opportunities = await db.query(
    'SELECT * FROM opportunities WHERE status = $1 ORDER BY deadline', 
    ['OPEN']
  );
  
  // Score each opportunity
  const scored = opportunities.rows.map(opp => ({
    ...opp,
    matchScore: calculateSkillMatch(studentProfile.rows[0].skills, opp.required_skills).matchPercentage,
    matchedSkills: calculateSkillMatch(studentProfile.rows[0].skills, opp.required_skills).matchedSkills
  }));
  
  // Return top 10 matches
  const recommended = scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  
  res.json(recommended);
});

// 4. Real-Time Notifications (WebSocket)
// backend/websocket.js
const WebSocket = require('ws');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });
  
  wss.on('connection', (ws) => {
    const userId = extractUserIdFromHeader(ws.upgradeReq);
    
    ws.on('message', (msg) => {
      const data = JSON.parse(msg);
      
      // Broadcast status updates to student
      if (data.type === 'APPLICATION_STATUS_CHANGE') {
        wss.clients.forEach(client => {
          if (client.userId === data.student_id) {
            client.send(JSON.stringify({
              type: 'NOTIFICATION',
              title: 'Application Status Updated',
              message: `Your application status changed to ${data.status}`,
              opportunity_id: data.opportunity_id
            }));
          }
        });
      }
    });
  });
}

// 5. Task Reminders (Cron)
// backend/jobs/taskReminders.js
cron.schedule('0 9 * * *', async () => {
  const dueTodayTasks = await db.query(`
    SELECT t.*, u.institute_email
    FROM tasks t
    JOIN users u ON t.student_id = u.user_id
    WHERE DATE(t.due_date) = CURRENT_DATE
    AND t.status != 'COMPLETED'
  `);
  
  dueTodayTasks.rows.forEach(task => {
    sendTaskReminderEmail(task.institute_email, {
      title: task.title,
      dueDate: task.due_date,
      priority: task.progress_percentage
    });
  });
});

// 6. Application Analytics
router.get('/api/opportunities/:id/analytics', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  const analytics = await db.query(`
    SELECT 
      o.opportunity_id,
      o.title,
      COUNT(a.application_id) as total_applications,
      COUNT(CASE WHEN a.status = 'APPLIED' THEN 1 END) as pending,
      COUNT(CASE WHEN a.status = 'SHORTLISTED' THEN 1 END) as shortlisted,
      COUNT(CASE WHEN a.status = 'ACCEPTED' THEN 1 END) as accepted,
      ROUND(100.0 * COUNT(CASE WHEN a.status = 'ACCEPTED' THEN 1 END) / COUNT(*), 2) as acceptance_rate
    FROM opportunities o
    LEFT JOIN applications a ON o.opportunity_id = a.opportunity_id
    WHERE o.opportunity_id = $1
    GROUP BY o.opportunity_id, o.title
  `, [id]);
  
  res.json(analytics.rows[0]);
});

// 7. Interview Scheduling
router.post('/api/applications/:application_id/schedule-interview', authenticateToken, async (req, res) => {
  const { date, time, meetingLink } = req.body;
  
  const updated = await db.query(
    `UPDATE applications 
     SET interview_date = $1, interview_time = $2, meeting_link = $3
     WHERE application_id = $4
     RETURNING *`,
    [date, time, meetingLink, req.params.application_id]
  );
  
  // Send email to student with interview details
  sendInterviewScheduleEmail(updated.rows[0].student_email, {
    date, time, meetingLink
  });
  
  res.json(updated.rows[0]);
});
```

---

## CROSS-PILLAR IMPROVEMENTS

### 1. **Real-Time Notifications System** ⭐ HIGH PRIORITY
```javascript
// Implement a centralized notification system
// backend/models/Notification.js
CREATE TABLE notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INTEGER,
  type VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  related_entity_id INTEGER,
  related_entity_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

// Push notifications on:
// - Grievance status updates
// - Opportunity deadlines approaching
// - Application status changes
// - Task reminders
// - New messages
```

### 2. **Role-Based Dashboard Customization** ⭐ HIGH PRIORITY
```javascript
// Each role gets custom dashboard view
// Student Dashboard: Opportunities, Tasks, Enrollments, Grievances
// Faculty Dashboard: Posted Opportunities, Applications, Classes
// Authority Dashboard: Assigned Grievances, Department Stats
// Admin Dashboard: System-wide stats, User management, Monitoring
```

### 3. **Analytics & Reporting** ⭐ HIGH PRIORITY
- Grievance resolution metrics
- Opportunity conversion rates
- Student engagement scores
- Department response times
- Platform usage statistics

### 4. **Integration with External Systems** ⭐ MEDIUM PRIORITY
- Email service (Nodemailer/SendGrid)
- SMS alerts (Twilio)
- Calendar sync (Google Calendar API)
- File storage (AWS S3/Cloudinary)
- Payment gateway (if stipends involved)

### 5. **Security Hardening** ⭐ HIGH PRIORITY
- [ ] Implement HTTPS everywhere
- [ ] Add rate limiting
- [ ] SQL injection prevention review
- [ ] XSS protection review
- [ ] Session timeout
- [ ] Token refresh mechanism
- [ ] API input validation

### 6. **Performance Optimization** ⭐ MEDIUM PRIORITY
- [ ] Database indexing on frequently queried columns
- [ ] Implement caching (Redis)
- [ ] Pagination on all list endpoints
- [ ] Lazy loading for images
- [ ] Code splitting in frontend
- [ ] CDN for static files

---

## RECOMMENDATIONS SUMMARY

### CRITICAL (Do First)
1. **Logout token blacklisting** - Security issue
2. **Email notification system** - Core feature expectation
3. **Account lockout mechanism** - Prevent brute force
4. **GPA/Performance tracking** - Academic necessity
5. **Resume upload** - Essential for job applications
6. **Skill matching** - UX improvement

### HIGH (Do Soon)
7. Automated email summaries for departments
8. Grievance escalation alerts
9. Exam schedule in calendar
10. Attendance tracking per student
11. Interview scheduling
12. Real-time notifications

### MEDIUM (Nice to Have)
13. Analytics dashboards
14. Opportunity recommendations
15. Performance metrics
16. Multi-factor authentication
17. Password reset flow
18. Student resource contributions

### LOW (Polish)
19. Offer letter generation
20. Interview feedback forms
21. Resource ratings/reviews
22. Task milestone tracking

---

## DEPLOYMENT CHECKLIST

- [x] Backend deployed to Render
- [x] Database connected
- [x] Seed data loaded
- [x] Basic API endpoints working
- [ ] Email service configured
- [ ] Error logging setup
- [ ] Monitoring/alerting active
- [ ] HTTPS enforced
- [ ] Rate limiting active
- [ ] Regular backups scheduled

---

## NEXT STEPS

1. **Week 1:** Implement critical security fixes + email system
2. **Week 2:** Add GPA tracking + attendance + resume uploads
3. **Week 3:** Build analytics dashboards + notifications
4. **Week 4:** Polish UI + optimize performance
5. **Week 5-6:** Deploy frontend + integration testing

**Current Grade: B+ (77.5%)**  
**Target: A (90%+)**  
**Recommended Focus:** Security, Notifications, Analytics

---

**Prepared by:** Digital Architecture Team  
**Date:** February 15, 2026  
**Status:** ACTIVE DEVELOPMENT
