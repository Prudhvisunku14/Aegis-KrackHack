-- =========================================
-- AEGIS - PILLAR I MASTER SETUP
-- Safe to run multiple times
-- =========================================

-- =========================
-- DROP OLD TABLES (order matters because of FK)
-- =========================
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- =========================
-- ROLES
-- =========================
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- =========================
-- DEPARTMENTS
-- =========================
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
);

-- =========================
-- USERS
-- =========================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    institute_email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role_id INTEGER NOT NULL,
    department_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_role
        FOREIGN KEY(role_id)
        REFERENCES roles(role_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_department
        FOREIGN KEY(department_id)
        REFERENCES departments(department_id)
        ON DELETE SET NULL
);

-- =========================
-- USER SESSIONS
-- =========================
CREATE TABLE user_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_user_session
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- =========================
-- ACTIVITY LOGS
-- =========================
CREATE TABLE activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_log
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);

-- =========================
-- INSERT DEFAULT DATA
-- =========================

-- Roles
INSERT INTO roles (role_name) VALUES
('Student'),
('Faculty'),
('Authority'),
('Admin');

-- Departments (edit as needed)
INSERT INTO departments (department_name) VALUES
('Computer Science'),
('Electrical'),
('Mechanical'),
('Civil'),
('Administration');
-- =========================================
-- PILLAR II : VOICE (GRIEVANCE SYSTEM)
-- Extends Pillar I
-- =========================================

-- =========================
-- GRIEVANCE CATEGORY
-- =========================
CREATE TABLE IF NOT EXISTS grievance_category (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

-- =========================
-- GRIEVANCE PRIORITY
-- =========================
CREATE TABLE IF NOT EXISTS grievance_priority (
    priority_id SERIAL PRIMARY KEY,
    priority_name VARCHAR(50) NOT NULL UNIQUE
);

-- =========================
-- GRIEVANCES
-- =========================
CREATE TABLE IF NOT EXISTS grievances (
    grievance_id SERIAL PRIMARY KEY,

    submitted_by INTEGER,  -- nullable for anonymous
    category_id INTEGER NOT NULL,
    priority_id INTEGER NOT NULL,
    assigned_to INTEGER,

    description TEXT NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Submitted',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_submitted_user
        FOREIGN KEY(submitted_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_assigned_user
        FOREIGN KEY(assigned_to)
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_category
        FOREIGN KEY(category_id)
        REFERENCES grievance_category(category_id),

    CONSTRAINT fk_priority
        FOREIGN KEY(priority_id)
        REFERENCES grievance_priority(priority_id)
);

-- =========================
-- GRIEVANCE IMAGES
-- =========================
CREATE TABLE IF NOT EXISTS grievance_images (
    image_id SERIAL PRIMARY KEY,
    grievance_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,

    CONSTRAINT fk_grievance_image
        FOREIGN KEY(grievance_id)
        REFERENCES grievances(grievance_id)
        ON DELETE CASCADE
);

-- =========================
-- GRIEVANCE REMARKS
-- =========================
CREATE TABLE IF NOT EXISTS grievance_remarks (
    remark_id SERIAL PRIMARY KEY,
    grievance_id INTEGER NOT NULL,
    authority_id INTEGER NOT NULL,
    remark_text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_grievance_remark
        FOREIGN KEY(grievance_id)
        REFERENCES grievances(grievance_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_authority_user
        FOREIGN KEY(authority_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- =========================
-- GRIEVANCE TIMELINE
-- =========================
CREATE TABLE IF NOT EXISTS grievance_timeline (
    timeline_id SERIAL PRIMARY KEY,
    grievance_id INTEGER NOT NULL,
    changed_by INTEGER NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_grievance_timeline
        FOREIGN KEY(grievance_id)
        REFERENCES grievances(grievance_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_changed_user
        FOREIGN KEY(changed_by)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- =========================
-- DEFAULT MASTER DATA
-- =========================

INSERT INTO grievance_category (category_name) VALUES
('Infrastructure'),
('Academics'),
('Hostel'),
('Food'),
('Other')
ON CONFLICT DO NOTHING;

INSERT INTO grievance_priority (priority_name) VALUES
('Low'),
('Medium'),
('High'),
('Urgent')
ON CONFLICT DO NOTHING;

-- =========================================
-- PILLAR III : FATE (ACADEMIC MASTERY)
-- =========================================

-- =========================
-- COURSES
-- =========================
CREATE TABLE IF NOT EXISTS courses (
    course_id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    credits INTEGER NOT NULL,

    department_id INTEGER,
    CONSTRAINT fk_course_department
        FOREIGN KEY(department_id)
        REFERENCES departments(department_id)
        ON DELETE SET NULL
);

-- =========================
-- ACADEMIC YEAR / SEMESTER
-- =========================
CREATE TABLE IF NOT EXISTS academic_year (
    year_id SERIAL PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL,  -- e.g. 2025-26
    semester VARCHAR(20) NOT NULL        -- Monsoon / Winter
);

-- =========================
-- ENROLLMENTS (WHO TAKES COURSE)
-- =========================
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    year_id INTEGER NOT NULL,

    CONSTRAINT fk_enroll_student
        FOREIGN KEY(student_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_enroll_course
        FOREIGN KEY(course_id)
        REFERENCES courses(course_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_enroll_year
        FOREIGN KEY(year_id)
        REFERENCES academic_year(year_id)
        ON DELETE CASCADE
);
-- =========================================
-- COURSE ENROLLMENT REQUESTS (APPROVAL SYSTEM)
-- =========================================

CREATE TABLE IF NOT EXISTS course_enrollment_requests (
    request_id SERIAL PRIMARY KEY,

    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    year_id INTEGER NOT NULL,

    status VARCHAR(20) DEFAULT 'PENDING', 
    -- PENDING / APPROVED / REJECTED

    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,

    reviewed_by INTEGER,  -- faculty who approved/rejected
    remarks TEXT,

    CONSTRAINT fk_request_student
        FOREIGN KEY(student_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_request_course
        FOREIGN KEY(course_id)
        REFERENCES courses(course_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_request_year
        FOREIGN KEY(year_id)
        REFERENCES academic_year(year_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_request_faculty
        FOREIGN KEY(reviewed_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT unique_request 
        UNIQUE(student_id, course_id, year_id)
);

-- =========================
-- FACULTY TEACHING COURSE
-- =========================
CREATE TABLE IF NOT EXISTS course_faculty (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    year_id INTEGER NOT NULL,

    CONSTRAINT fk_faculty_user
        FOREIGN KEY(faculty_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_faculty_course
        FOREIGN KEY(course_id)
        REFERENCES courses(course_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_faculty_year
        FOREIGN KEY(year_id)
        REFERENCES academic_year(year_id)
        ON DELETE CASCADE
);

-- =========================
-- ATTENDANCE LOGS
-- =========================
CREATE TABLE IF NOT EXISTS attendance_logs (
    attendance_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    date DATE NOT NULL,
    present BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_attendance_student
        FOREIGN KEY(student_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_attendance_course
        FOREIGN KEY(course_id)
        REFERENCES courses(course_id)
        ON DELETE CASCADE
);

-- =========================
-- GRADES
-- =========================
CREATE TABLE IF NOT EXISTS grades (
    grade_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    year_id INTEGER NOT NULL,
    grade VARCHAR(5),  -- A, A+, etc.

    CONSTRAINT fk_grade_student
        FOREIGN KEY(student_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_grade_course
        FOREIGN KEY(course_id)
        REFERENCES courses(course_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_grade_year
        FOREIGN KEY(year_id)
        REFERENCES academic_year(year_id)
        ON DELETE CASCADE
);

-- =========================
-- ACADEMIC RESOURCES
-- =========================
CREATE TABLE IF NOT EXISTS academic_resources (
    resource_id SERIAL PRIMARY KEY,
    uploaded_by INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    year_id INTEGER,
    type VARCHAR(100),

    CONSTRAINT fk_resource_user
        FOREIGN KEY(uploaded_by)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_resource_course
        FOREIGN KEY(course_id)
        REFERENCES courses(course_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_resource_year
        FOREIGN KEY(year_id)
        REFERENCES academic_year(year_id)
        ON DELETE SET NULL
);

-- =========================
-- RESOURCE TAGS
-- =========================
CREATE TABLE IF NOT EXISTS resource_tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(100) UNIQUE
);

-- =========================
-- RESOURCE TAG MAP (M:M)
-- =========================
CREATE TABLE IF NOT EXISTS resource_tag_map (
    resource_id INTEGER,
    tag_id INTEGER,

    PRIMARY KEY(resource_id, tag_id),

    CONSTRAINT fk_map_resource
        FOREIGN KEY(resource_id)
        REFERENCES academic_resources(resource_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_map_tag
        FOREIGN KEY(tag_id)
        REFERENCES resource_tags(tag_id)
        ON DELETE CASCADE
);

-- =========================
-- ACADEMIC EVENTS / CALENDAR
-- =========================
CREATE TABLE IF NOT EXISTS academic_events (
    event_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    course_id INTEGER,

    CONSTRAINT fk_event_course
        FOREIGN KEY(course_id)
        REFERENCES courses(course_id)
        ON DELETE SET NULL
);
-- =========================================
-- PILLAR IV : OPPORTUNITY
-- =========================================

-- =========================
-- OPPORTUNITIES
-- =========================
CREATE TABLE IF NOT EXISTS opportunities (
    opportunity_id SERIAL PRIMARY KEY,
    posted_by INTEGER NOT NULL,
    department_id INTEGER,

    title VARCHAR(255) NOT NULL,
    description TEXT,
    required_skills TEXT,
    duration VARCHAR(100),
    stipend VARCHAR(100),
    deadline DATE,

    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_opportunity_user
        FOREIGN KEY(posted_by)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_opportunity_department
        FOREIGN KEY(department_id)
        REFERENCES departments(department_id)
        ON DELETE SET NULL
);

-- =========================
-- APPLICATIONS
-- =========================
CREATE TABLE IF NOT EXISTS applications (
    application_id SERIAL PRIMARY KEY,
    opportunity_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,

    resume_path TEXT,
    status VARCHAR(50) DEFAULT 'APPLIED',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_application_opportunity
        FOREIGN KEY(opportunity_id)
        REFERENCES opportunities(opportunity_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_application_student
        FOREIGN KEY(student_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- =========================
-- BOOKMARKS (M:M)
-- =========================
CREATE TABLE IF NOT EXISTS bookmarks (
    student_id INTEGER,
    opportunity_id INTEGER,

    PRIMARY KEY(student_id, opportunity_id),

    CONSTRAINT fk_bookmark_student
        FOREIGN KEY(student_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_bookmark_opportunity
        FOREIGN KEY(opportunity_id)
        REFERENCES opportunities(opportunity_id)
        ON DELETE CASCADE
);

-- =========================
-- OPPORTUNITY MESSAGES
-- =========================
CREATE TABLE IF NOT EXISTS opportunity_messages (
    message_id SERIAL PRIMARY KEY,
    opportunity_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,

    message_text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_message_opportunity
        FOREIGN KEY(opportunity_id)
        REFERENCES opportunities(opportunity_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_message_sender
        FOREIGN KEY(sender_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- =========================
-- PERSONAL TASKS / TRACKER
-- =========================
CREATE TABLE IF NOT EXISTS tasks (
    task_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),

    due_date DATE,
    status VARCHAR(50) DEFAULT 'PENDING',
    progress_percentage INTEGER DEFAULT 0,

    CONSTRAINT fk_task_student
        FOREIGN KEY(student_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

SELECT * FROM users;

SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users';
