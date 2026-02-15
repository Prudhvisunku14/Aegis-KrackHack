// Verification script to check if seed data was inserted correctly
const db = require('../db');

async function verifySeed() {
  try {
    console.log('\n🔍 AEGIS Database Seed Verification\n');
    console.log('=====================================\n');

    // Pillar I: Users & Authentication
    console.log('📋 PILLAR I: USERS & AUTHENTICATION');
    const users = await db.pool.query('SELECT COUNT(*) as count FROM users');
    const roles = await db.pool.query('SELECT COUNT(*) as count FROM roles');
    const departments = await db.pool.query('SELECT COUNT(*) as count FROM departments');
    const sessions = await db.pool.query('SELECT COUNT(*) as count FROM user_sessions');
    const logs = await db.pool.query('SELECT COUNT(*) as count FROM activity_logs');
    
    console.log(`  ✓ Users: ${users.rows[0].count}`);
    console.log(`  ✓ Roles: ${roles.rows[0].count}`);
    console.log(`  ✓ Departments: ${departments.rows[0].count}`);
    console.log(`  ✓ User Sessions: ${sessions.rows[0].count}`);
    console.log(`  ✓ Activity Logs: ${logs.rows[0].count}\n`);

    // Pillar II: Grievances
    console.log('📋 PILLAR II: GRIEVANCES');
    const grievances = await db.pool.query('SELECT COUNT(*) as count FROM grievances');
    const grievCat = await db.pool.query('SELECT COUNT(*) as count FROM grievance_category');
    const grievPri = await db.pool.query('SELECT COUNT(*) as count FROM grievance_priority');
    const remarks = await db.pool.query('SELECT COUNT(*) as count FROM grievance_remarks');
    const timeline = await db.pool.query('SELECT COUNT(*) as count FROM grievance_timeline');
    
    console.log(`  ✓ Grievances: ${grievances.rows[0].count}`);
    console.log(`  ✓ Categories: ${grievCat.rows[0].count}`);
    console.log(`  ✓ Priorities: ${grievPri.rows[0].count}`);
    console.log(`  ✓ Remarks: ${remarks.rows[0].count}`);
    console.log(`  ✓ Timeline: ${timeline.rows[0].count}\n`);

    // Pillar III: Academic
    console.log('📋 PILLAR III: ACADEMIC RESOURCES');
    const courses = await db.pool.query('SELECT COUNT(*) as count FROM courses');
    const academicYear = await db.pool.query('SELECT COUNT(*) as count FROM academic_year');
    const enrollments = await db.pool.query('SELECT COUNT(*) as count FROM enrollments');
    const faculty = await db.pool.query('SELECT COUNT(*) as count FROM course_faculty');
    const attendance = await db.pool.query('SELECT COUNT(*) as count FROM attendance_logs');
    const grades = await db.pool.query('SELECT COUNT(*) as count FROM grades');
    const resources = await db.pool.query('SELECT COUNT(*) as count FROM academic_resources');
    const tags = await db.pool.query('SELECT COUNT(*) as count FROM resource_tags');
    const events = await db.pool.query('SELECT COUNT(*) as count FROM academic_events');
    
    console.log(`  ✓ Courses: ${courses.rows[0].count}`);
    console.log(`  ✓ Academic Years: ${academicYear.rows[0].count}`);
    console.log(`  ✓ Enrollments: ${enrollments.rows[0].count}`);
    console.log(`  ✓ Course Faculty: ${faculty.rows[0].count}`);
    console.log(`  ✓ Attendance Logs: ${attendance.rows[0].count}`);
    console.log(`  ✓ Grades: ${grades.rows[0].count}`);
    console.log(`  ✓ Resources: ${resources.rows[0].count}`);
    console.log(`  ✓ Tags: ${tags.rows[0].count}`);
    console.log(`  ✓ Events: ${events.rows[0].count}\n`);

    // Pillar IV: Opportunities
    console.log('📋 PILLAR IV: OPPORTUNITIES');
    const opportunities = await db.pool.query('SELECT COUNT(*) as count FROM opportunities');
    const applications = await db.pool.query('SELECT COUNT(*) as count FROM applications');
    const bookmarks = await db.pool.query('SELECT COUNT(*) as count FROM bookmarks');
    const messages = await db.pool.query('SELECT COUNT(*) as count FROM opportunity_messages');
    const tasks = await db.pool.query('SELECT COUNT(*) as count FROM tasks');
    
    console.log(`  ✓ Opportunities: ${opportunities.rows[0].count}`);
    console.log(`  ✓ Applications: ${applications.rows[0].count}`);
    console.log(`  ✓ Bookmarks: ${bookmarks.rows[0].count}`);
    console.log(`  ✓ Messages: ${messages.rows[0].count}`);
    console.log(`  ✓ Tasks: ${tasks.rows[0].count}\n`);

    console.log('=====================================');
    console.log('✅ SEED DATA VERIFICATION COMPLETE!\n');

    // Sample data from opportunities
    const oppSample = await db.pool.query('SELECT opportunity_id, title, status FROM opportunities LIMIT 3');
    console.log('📌 Sample Opportunities:');
    oppSample.rows.forEach(opp => {
      console.log(`   - ${opp.title} [${opp.status}]`);
    });

    // Sample users
    const userSample = await db.pool.query(`
      SELECT u.full_name, r.role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.role_id 
      LIMIT 5
    `);
    console.log('\n📌 Sample Users:');
    userSample.rows.forEach(user => {
      console.log(`   - ${user.full_name} (${user.role_name})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Verification Failed:', error.message);
    process.exit(1);
  }
}

verifySeed();
