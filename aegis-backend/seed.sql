-- AEGIS Database Seed Data
-- Comprehensive dummy data for all 4 pillars
-- Run after init.sql

-- ============================================================================
-- PILLAR I: USERS & AUTHENTICATION
-- ============================================================================

-- Users (matching roles and departments from init.sql)
INSERT INTO users (institute_email, password_hash, full_name, role_id, department_id, is_active) VALUES
('admin@aegis.edu', '$2b$10$YourHashedAdminPassword123456789', 'Admin User',
 (SELECT role_id FROM roles WHERE role_name = 'Admin'), 
 (SELECT department_id FROM departments WHERE department_name = 'Administration'), 
 true),

('rajesh.kumar@aegis.edu', '$2b$10$FacultyHashedPassword1234567890', 'Dr. Rajesh Kumar',
 (SELECT role_id FROM roles WHERE role_name = 'Faculty'),
 (SELECT department_id FROM departments WHERE department_name = 'Computer Science'),
 true),

('neha.sharma@aegis.edu', '$2b$10$FacultyHashedPassword1234567890', 'Prof. Neha Sharma',
 (SELECT role_id FROM roles WHERE role_name = 'Faculty'),
 (SELECT department_id FROM departments WHERE department_name = 'Electrical'),
 true),

('amit.patel@aegis.edu', '$2b$10$FacultyHashedPassword1234567890', 'Dr. Amit Patel',
 (SELECT role_id FROM roles WHERE role_name = 'Faculty'),
 (SELECT department_id FROM departments WHERE department_name = 'Mechanical'),
 true),

('dean@aegis.edu', '$2b$10$AuthorityHashedPassword123456789', 'Authority - Dean',
 (SELECT role_id FROM roles WHERE role_name = 'Authority'),
 (SELECT department_id FROM departments WHERE department_name = 'Administration'),
 true),

('priya.singh@aegis.edu', '$2b$10$StudentHashedPassword12345678901', 'Priya Singh',
 (SELECT role_id FROM roles WHERE role_name = 'Student'),
 (SELECT department_id FROM departments WHERE department_name = 'Computer Science'),
 true),

('vikram.desai@aegis.edu', '$2b$10$StudentHashedPassword12345678901', 'Vikram Desai',
 (SELECT role_id FROM roles WHERE role_name = 'Student'),
 (SELECT department_id FROM departments WHERE department_name = 'Computer Science'),
 true),

('anjali.verma@aegis.edu', '$2b$10$StudentHashedPassword12345678901', 'Anjali Verma',
 (SELECT role_id FROM roles WHERE role_name = 'Student'),
 (SELECT department_id FROM departments WHERE department_name = 'Electrical'),
 true),

('rohan.gupta@aegis.edu', '$2b$10$StudentHashedPassword12345678901', 'Rohan Gupta',
 (SELECT role_id FROM roles WHERE role_name = 'Student'),
 (SELECT department_id FROM departments WHERE department_name = 'Mechanical'),
 true),

('diya.chatterjee@aegis.edu', '$2b$10$StudentHashedPassword12345678901', 'Diya Chatterjee',
 (SELECT role_id FROM roles WHERE role_name = 'Student'),
 (SELECT department_id FROM departments WHERE department_name = 'Civil'),
 true);

-- User Sessions
INSERT INTO user_sessions (user_id, token, expires_at) VALUES
((SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'), 'token_priya_12345678', NOW() + INTERVAL '24 hours'),
((SELECT user_id FROM users WHERE institute_email = 'vikram.desai@aegis.edu'), 'token_vikram_87654321', NOW() + INTERVAL '24 hours'),
((SELECT user_id FROM users WHERE institute_email = 'admin@aegis.edu'), 'token_admin_admin123456', NOW() + INTERVAL '24 hours');

-- Activity Logs
INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES
((SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'), 'LOGIN', 'AUTH', NULL),
((SELECT user_id FROM users WHERE institute_email = 'vikram.desai@aegis.edu'), 'VIEW', 'OPPORTUNITY', 1),
((SELECT user_id FROM users WHERE institute_email = 'admin@aegis.edu'), 'CREATE', 'OPPORTUNITY', 1);

-- ============================================================================
-- PILLAR II: GRIEVANCES
-- ============================================================================

INSERT INTO grievances (submitted_by, category_id, priority_id, assigned_to, description, location, status) VALUES
((SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'),
 (SELECT category_id FROM grievance_category WHERE category_name = 'Academics'),
 (SELECT priority_id FROM grievance_priority WHERE priority_name = 'High'),
 (SELECT user_id FROM users WHERE institute_email = 'dean@aegis.edu'),
 'Faculty Attendance Irregular - Prof. Sharma has been absent from many classes without prior notice, affecting student learning.',
 'Class A-101',
 'Submitted'),

((SELECT user_id FROM users WHERE institute_email = 'anjali.verma@aegis.edu'),
 (SELECT category_id FROM grievance_category WHERE category_name = 'Infrastructure'),
 (SELECT priority_id FROM grievance_priority WHERE priority_name = 'Medium'),
 (SELECT user_id FROM users WHERE institute_email = 'dean@aegis.edu'),
 'Laboratory Equipment Malfunction - The oscilloscope in the Electronics Lab is not functioning properly.',
 'Electronics Lab',
 'Submitted'),

((SELECT user_id FROM users WHERE institute_email = 'vikram.desai@aegis.edu'),
 (SELECT category_id FROM grievance_category WHERE category_name = 'Academics'),
 (SELECT priority_id FROM grievance_priority WHERE priority_name = 'High'),
 (SELECT user_id FROM users WHERE institute_email = 'rajesh.kumar@aegis.edu'),
 'Unfair Grading in Calculus - Believe the grading for the recent Calculus exam was not fair.',
 'Department Office',
 'Submitted'),

((SELECT user_id FROM users WHERE institute_email = 'rohan.gupta@aegis.edu'),
 (SELECT category_id FROM grievance_category WHERE category_name = 'Hostel'),
 (SELECT priority_id FROM grievance_priority WHERE priority_name = 'Low'),
 (SELECT user_id FROM users WHERE institute_email = 'dean@aegis.edu'),
 'Hostel Room Cleanliness - The hostel rooms lack proper cleaning and maintenance.',
 'Hostel Block A',
 'Submitted');

-- Grievance Remarks
INSERT INTO grievance_remarks (grievance_id, authority_id, remark_text) VALUES
((SELECT grievance_id FROM grievances LIMIT 1 OFFSET 0),
 (SELECT user_id FROM users WHERE institute_email = 'dean@aegis.edu'),
 'Will investigate faculty attendance with department head'),

((SELECT grievance_id FROM grievances LIMIT 1 OFFSET 1),
 (SELECT user_id FROM users WHERE institute_email = 'dean@aegis.edu'),
 'Lab equipment will be serviced next week'),

((SELECT grievance_id FROM grievances LIMIT 1 OFFSET 2),
 (SELECT user_id FROM users WHERE institute_email = 'rajesh.kumar@aegis.edu'),
 'Re-evaluated exam, marks adjusted favorably'),

((SELECT grievance_id FROM grievances ORDER BY grievance_id LIMIT 1 OFFSET 3),
 (SELECT user_id FROM users WHERE institute_email = 'dean@aegis.edu'),
 'Assigned to hostel management team');

-- Grievance Timeline
INSERT INTO grievance_timeline (grievance_id, changed_by, old_status, new_status) VALUES
((SELECT grievance_id FROM grievances LIMIT 1 OFFSET 0),
 (SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'),
 NULL, 'Submitted'),
((SELECT grievance_id FROM grievances LIMIT 1 OFFSET 0),
 (SELECT user_id FROM users WHERE institute_email = 'dean@aegis.edu'),
 'Submitted', 'In Progress'),
((SELECT grievance_id FROM grievances LIMIT 1 OFFSET 1),
 (SELECT user_id FROM users WHERE institute_email = 'anjali.verma@aegis.edu'),
 NULL, 'Submitted');

-- ============================================================================
-- PILLAR III: ACADEMIC RESOURCES
-- ============================================================================

-- Academic Year
INSERT INTO academic_year (academic_year, semester) VALUES
('2024-25', 'Monsoon'),
('2024-25', 'Winter'),
('2023-24', 'Monsoon');

-- Courses
INSERT INTO courses (course_code, course_name, credits, department_id) VALUES
('CS101', 'Introduction to Programming', 3, (SELECT department_id FROM departments WHERE department_name = 'Computer Science')),
('CS102', 'Data Structures', 4, (SELECT department_id FROM departments WHERE department_name = 'Computer Science')),
('CS201', 'Web Development', 3, (SELECT department_id FROM departments WHERE department_name = 'Computer Science')),
('EE101', 'Circuits and Networks', 4, (SELECT department_id FROM departments WHERE department_name = 'Electrical')),
('ME101', 'Engineering Mechanics', 3, (SELECT department_id FROM departments WHERE department_name = 'Mechanical')),
('CE101', 'Engineering Geology', 3, (SELECT department_id FROM departments WHERE department_name = 'Civil'));

-- Enrollments
INSERT INTO enrollments (student_id, course_id, year_id) VALUES
((SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CS101'), (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon')),
((SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CS102'), (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon')),
((SELECT user_id FROM users WHERE institute_email = 'vikram.desai@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CS101'), (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon')),
((SELECT user_id FROM users WHERE institute_email = 'vikram.desai@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CS201'), (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon')),
((SELECT user_id FROM users WHERE institute_email = 'anjali.verma@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'EE101'), (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon')),
((SELECT user_id FROM users WHERE institute_email = 'rohan.gupta@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'ME101'), (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon')),
((SELECT user_id FROM users WHERE institute_email = 'diya.chatterjee@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CE101'), (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon'));

-- Course Faculty
INSERT INTO course_faculty (faculty_id, course_id, year_id) VALUES
((SELECT user_id FROM users WHERE institute_email = 'rajesh.kumar@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CS101'), (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon')),
((SELECT user_id FROM users WHERE institute_email = 'rajesh.kumar@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CS102'), (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon')),
((SELECT user_id FROM users WHERE institute_email = 'neha.sharma@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'EE101'), (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon')),
((SELECT user_id FROM users WHERE institute_email = 'amit.patel@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'ME101'), (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon'));

-- Attendance Logs
INSERT INTO attendance_logs (student_id, course_id, date, present) VALUES
((SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CS101'), '2024-11-01', true),
((SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CS101'), '2024-11-02', true),
((SELECT user_id FROM users WHERE institute_email = 'vikram.desai@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CS101'), '2024-11-01', true),
((SELECT user_id FROM users WHERE institute_email = 'vikram.desai@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CS101'), '2024-11-02', false);

-- Grades
INSERT INTO grades (student_id, course_id, year_id, grade) VALUES
((SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CS101'), (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon'), 'A'),
((SELECT user_id FROM users WHERE institute_email = 'vikram.desai@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CS101'), (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon'), 'B+'),
((SELECT user_id FROM users WHERE institute_email = 'anjali.verma@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'EE101'), (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon'), 'B');

-- Academic Resources
INSERT INTO academic_resources (uploaded_by, course_id, title, file_path, year_id, type) VALUES
((SELECT user_id FROM users WHERE institute_email = 'rajesh.kumar@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CS101'), 'Python Basics Guide', 'https://vault-of-knowledge.com/python-basics.pdf', (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon'), 'PDF'),
((SELECT user_id FROM users WHERE institute_email = 'rajesh.kumar@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CS102'), 'Data Structures Lecture Notes', 'https://vault-of-knowledge.com/ds-notes.pdf', (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon'), 'PDF'),
((SELECT user_id FROM users WHERE institute_email = 'neha.sharma@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'EE101'), 'Circuit Analysis Examples', 'https://vault-of-knowledge.com/circuits.pdf', (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon'), 'PDF'),
((SELECT user_id FROM users WHERE institute_email = 'amit.patel@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'ME101'), 'Mechanical Design Handbook', 'https://vault-of-knowledge.com/mech-design.pdf', (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon'), 'PDF'),
((SELECT user_id FROM users WHERE institute_email = 'dean@aegis.edu'), (SELECT course_id FROM courses WHERE course_code = 'CE101'), 'Civil Engineering Standards', 'https://vault-of-knowledge.com/civil-codes.pdf', (SELECT year_id FROM academic_year WHERE academic_year = '2024-25' AND semester = 'Monsoon'), 'PDF');

-- Resource Tags
INSERT INTO resource_tags (tag_name) VALUES
('Python'), ('Web Development'), ('Data Structures'), ('Circuits'), ('Mechanics'), ('Design'), ('Standards'), ('Tutorial'), ('Reference'), ('Exam Prep');

-- Resource Tag Mapping
INSERT INTO resource_tag_map (resource_id, tag_id) VALUES
((SELECT resource_id FROM academic_resources WHERE title = 'Python Basics Guide'), (SELECT tag_id FROM resource_tags WHERE tag_name = 'Python')),
((SELECT resource_id FROM academic_resources WHERE title = 'Python Basics Guide'), (SELECT tag_id FROM resource_tags WHERE tag_name = 'Tutorial')),
((SELECT resource_id FROM academic_resources WHERE title = 'Data Structures Lecture Notes'), (SELECT tag_id FROM resource_tags WHERE tag_name = 'Data Structures')),
((SELECT resource_id FROM academic_resources WHERE title = 'Data Structures Lecture Notes'), (SELECT tag_id FROM resource_tags WHERE tag_name = 'Reference')),
((SELECT resource_id FROM academic_resources WHERE title = 'Circuit Analysis Examples'), (SELECT tag_id FROM resource_tags WHERE tag_name = 'Circuits')),
((SELECT resource_id FROM academic_resources WHERE title = 'Mechanical Design Handbook'), (SELECT tag_id FROM resource_tags WHERE tag_name = 'Design')),
((SELECT resource_id FROM academic_resources WHERE title = 'Civil Engineering Standards'), (SELECT tag_id FROM resource_tags WHERE tag_name = 'Standards'));

-- Academic Events
INSERT INTO academic_events (title, description, event_date, course_id) VALUES
('Mid-Semester Exam - CS101', 'Mid-semester examination for CS101', '2024-10-15', (SELECT course_id FROM courses WHERE course_code = 'CS101')),
('Guest Lecture: AI in Industry', 'Industry expert discusses AI applications', '2024-12-10', NULL),
('Robotics Workshop', 'Hands-on workshop on robotics and automation', '2024-11-20', NULL),
('End-Semester Exam', 'Final examinations across all courses', '2024-12-20', NULL);

-- ============================================================================
-- PILLAR IV: OPPORTUNITIES (Internships, Placements, Scholarships)
-- ============================================================================

INSERT INTO opportunities (
  posted_by, department_id, title, description, required_skills, duration, stipend, deadline, status
) VALUES
(
  (SELECT user_id FROM users WHERE institute_email = 'rajesh.kumar@aegis.edu'),
  (SELECT department_id FROM departments WHERE department_name = 'Computer Science'),
  'Software Development Internship at TechCorp',
  'Exciting opportunity to work on cutting-edge web applications. Candidates should have knowledge of MERN stack and PostgreSQL. Located in Bangalore.',
  'React, Node.js, PostgreSQL, Git',
  '6 months',
  '15000',
  '2025-01-31',
  'OPEN'
),
(
  (SELECT user_id FROM users WHERE institute_email = 'rajesh.kumar@aegis.edu'),
  (SELECT department_id FROM departments WHERE department_name = 'Computer Science'),
  'AI/ML Research Fellowship',
  'Join our AI research lab to work on machine learning models for real-world applications. Requires Python, TensorFlow, and research background.',
  'Python, Machine Learning, TensorFlow, Statistics',
  '12 months',
  '25000',
  '2025-02-28',
  'OPEN'
),
(
  (SELECT user_id FROM users WHERE institute_email = 'neha.sharma@aegis.edu'),
  (SELECT department_id FROM departments WHERE department_name = 'Electrical'),
  'Electrical Systems Internship - Power Company',
  'Work with power generation and distribution systems. Candidates should know circuit design and SCADA systems.',
  'Circuit Design, SCADA, Power Systems, Simulation Software',
  '4 months',
  '12000',
  '2025-02-15',
  'OPEN'
),
(
  (SELECT user_id FROM users WHERE institute_email = 'amit.patel@aegis.edu'),
  (SELECT department_id FROM departments WHERE department_name = 'Mechanical'),
  'CAD Design Internship - Manufacturing',
  'Design and develop mechanical components using AutoCAD and Solidworks. Requires proficiency in 3D modeling.',
  'AutoCAD, Solidworks, CAD Design, Engineering Mechanics',
  '6 months',
  '13000',
  '2025-03-01',
  'OPEN'
),
(
  (SELECT user_id FROM users WHERE institute_email = 'dean@aegis.edu'),
  (SELECT department_id FROM departments WHERE department_name = 'Civil'),
  'Structural Engineering Project - Construction Firm',
  'Work on real-world construction projects. Learn structural analysis and site management.',
  'Structural Analysis, STAAD Pro, Site Management, Surveying',
  '5 months',
  '11000',
  '2025-02-20',
  'OPEN'
),
(
  (SELECT user_id FROM users WHERE institute_email = 'rajesh.kumar@aegis.edu'),
  (SELECT department_id FROM departments WHERE department_name = 'Computer Science'),
  'Full Stack Developer - Startup',
  'Join a fast-growing startup to build scalable web applications. Competitive stipend and learning opportunity.',
  'React, Node.js, Databases, RESTful APIs, Docker',
  '3 months',
  '10000',
  '2025-01-15',
  'CLOSED'
),
(
  (SELECT user_id FROM users WHERE institute_email = 'rajesh.kumar@aegis.edu'),
  (SELECT department_id FROM departments WHERE department_name = 'Computer Science'),
  'Cloud Infrastructure Internship - AWS',
  'Learn AWS services and cloud infrastructure design. Deploy and manage cloud applications.',
  'AWS, Linux, Docker, Cloud Architecture',
  '6 months',
  '18000',
  '2025-03-15',
  'OPEN'
),
(
  (SELECT user_id FROM users WHERE institute_email = 'neha.sharma@aegis.edu'),
  (SELECT department_id FROM departments WHERE department_name = 'Electrical'),
  'IoT Development - Smart Devices',
  'Build IoT solutions using Arduino and raspberry Pi. Work on smart home and industrial IoT projects.',
  'embedded C, Arduino, IoT Protocols, Sensors',
  '4 months',
  '14000',
  '2025-02-28',
  'OPEN'
);

-- Applications (students applying for opportunities)
INSERT INTO applications (opportunity_id, student_id, status, resume_path) VALUES
((SELECT opportunity_id FROM opportunities LIMIT 1 OFFSET 0), (SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'), 'APPLIED', NULL),
((SELECT opportunity_id FROM opportunities LIMIT 1 OFFSET 0), (SELECT user_id FROM users WHERE institute_email = 'vikram.desai@aegis.edu'), 'APPLIED', NULL),
((SELECT opportunity_id FROM opportunities LIMIT 1 OFFSET 1), (SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'), 'APPLIED', NULL),
((SELECT opportunity_id FROM opportunities LIMIT 1 OFFSET 3), (SELECT user_id FROM users WHERE institute_email = 'rohan.gupta@aegis.edu'), 'APPLIED', NULL),
((SELECT opportunity_id FROM opportunities LIMIT 1 OFFSET 6), (SELECT user_id FROM users WHERE institute_email = 'vikram.desai@aegis.edu'), 'APPLIED', NULL),
((SELECT opportunity_id FROM opportunities LIMIT 1 OFFSET 7), (SELECT user_id FROM users WHERE institute_email = 'anjali.verma@aegis.edu'), 'APPLIED', NULL);

-- Bookmarks (students bookmarking opportunities they're interested in)
INSERT INTO bookmarks (student_id, opportunity_id) VALUES
((SELECT user_id FROM users WHERE institute_email = 'vikram.desai@aegis.edu'), (SELECT opportunity_id FROM opportunities LIMIT 1 OFFSET 1)),
((SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'), (SELECT opportunity_id FROM opportunities LIMIT 1 OFFSET 6)),
((SELECT user_id FROM users WHERE institute_email = 'rohan.gupta@aegis.edu'), (SELECT opportunity_id FROM opportunities LIMIT 1 OFFSET 7)),
((SELECT user_id FROM users WHERE institute_email = 'diya.chatterjee@aegis.edu'), (SELECT opportunity_id FROM opportunities LIMIT 1 OFFSET 4)),
((SELECT user_id FROM users WHERE institute_email = 'anjali.verma@aegis.edu'), (SELECT opportunity_id FROM opportunities LIMIT 1 OFFSET 0));

-- Opportunity Messages (communication)
INSERT INTO opportunity_messages (opportunity_id, sender_id, message_text) VALUES
((SELECT opportunity_id FROM opportunities LIMIT 1 OFFSET 0), (SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'), 'Hi Sir, I wanted to clarify about the deployment requirements mentioned in the JD. Can we discuss?'),
((SELECT opportunity_id FROM opportunities LIMIT 1 OFFSET 0), (SELECT user_id FROM users WHERE institute_email = 'rajesh.kumar@aegis.edu'), 'Sure Priya! Docker knowledge is preferred but not mandatory. We provide training.'),
((SELECT opportunity_id FROM opportunities LIMIT 1 OFFSET 1), (SELECT user_id FROM users WHERE institute_email = 'vikram.desai@aegis.edu'), 'Is the research background preference for published papers or project portfolio?');

-- Tasks (for students to track deliverables)
INSERT INTO tasks (student_id, title, description, due_date, status, progress_percentage) VALUES
((SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'), 'Setup development environment', 'Install Node.js, PostgreSQL, and configure VSCode extensions', '2025-01-15', 'PENDING', 100),
((SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'), 'Build user authentication module', 'Implement JWT-based authentication with register/login endpoints', '2025-02-15', 'PENDING', 50),
((SELECT user_id FROM users WHERE institute_email = 'priya.singh@aegis.edu'), 'Create REST API endpoints', 'Build CRUD endpoints for core resources following REST conventions', '2025-03-01', 'PENDING', 0),
((SELECT user_id FROM users WHERE institute_email = 'rohan.gupta@aegis.edu'), 'Learn Solidworks basics', 'Complete online tutorial on Solidworks interface and tools', '2025-01-20', 'PENDING', 100),
((SELECT user_id FROM users WHERE institute_email = 'rohan.gupta@aegis.edu'), 'Design mechanical bracket', 'Create 3D model of bracket assembly as per specifications', '2025-02-15', 'PENDING', 60),
((SELECT user_id FROM users WHERE institute_email = 'anjali.verma@aegis.edu'), 'Setup Arduino development board', 'Flash firmware and test basic GPIO operations', '2025-01-10', 'PENDING', 100),
((SELECT user_id FROM users WHERE institute_email = 'anjali.verma@aegis.edu'), 'Sensor integration project', 'Connect temperature and humidity sensors to Arduino', '2025-02-01', 'PENDING', 70);

-- ============================================================================
-- SEED DATA SUMMARY
-- ============================================================================
-- Users: 1 Admin, 1 Authority, 3 Faculty, 5 Students = 10 total users
-- Grievances: 4 grievances with remarks and timeline
-- Academic: 6 courses, 7 enrollments, 4 faculty assignments, 4 attendance logs, 3 grades, 5 resources with 7 tags
-- Opportunities: 8 opportunities (7 open, 1 closed) with 6 applications, 5 bookmarks, 3 messages, 7 tasks
-- ============================================================================
