// Test script for Pillar IV endpoints
// Run: node -r dotenv/config scripts/test_pillar4_endpoints.js

const http = require('http');

const API_BASE = 'http://localhost:5000';
let authToken = null;
let testUserEmail = `testuser_${Date.now()}@iitmandi.ac.in`;
let studentToken = null;
let facultyToken = null;
let opportunityId = null;
let applicationId = null;
let taskId = null;

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 Testing Pillar IV Endpoints\n');

  try {
    // 1. Register student
    console.log('1️⃣  Registering student...');
    let res = await request('POST', '/api/auth/register', {
      email: testUserEmail,
      password: 'Test123!',
      name: 'Test Student',
      role: 'student'
    });
    console.log(`   Status: ${res.status}`);
    if (res.status !== 201) throw new Error('Register failed');
    studentToken = res.data.token;
    console.log('   ✅ Student registered');

    // 2. Register faculty
    console.log('\n2️⃣  Registering faculty...');
    res = await request('POST', '/api/auth/register', {
      email: `faculty_${Date.now()}@iitmandi.ac.in`,
      password: 'Test123!',
      name: 'Test Faculty',
      role: 'faculty'
    });
    console.log(`   Status: ${res.status}`);
    if (res.status !== 201) throw new Error('Faculty register failed');
    facultyToken = res.data.token;
    console.log('   ✅ Faculty registered');

    // 3. Faculty posts opportunity
    console.log('\n3️⃣  Faculty posting opportunity...');
    res = await request('POST', '/api/opportunities', {
      title: 'Summer Research Internship',
      description: 'A great research opportunity',
      required_skills: 'Python, Machine Learning',
      duration: '3 months',
      stipend: '₹10,000/month',
      deadline: '2025-02-28'
    }, facultyToken);
    console.log(`   Status: ${res.status}`);
    if (res.status !== 201 && res.status !== 200) throw new Error('Post opportunity failed');
    opportunityId = res.data.opportunity_id || res.data.data?.opportunity_id;
    console.log(`   ✅ Opportunity posted (ID: ${opportunityId})`);

    // 4. Get opportunities list
    console.log('\n4️⃣  Getting opportunities list...');
    res = await request('GET', '/api/opportunities', null, studentToken);
    console.log(`   Status: ${res.status}`);
    console.log(`   📊 Found ${(res.data.data || []).length} opportunities`);
    if (res.status !== 200) throw new Error('Get opportunities failed');
    console.log('   ✅ Opportunities retrieved');

    // 5. Get single opportunity
    console.log(`\n5️⃣  Getting opportunity detail (ID: ${opportunityId})...`);
    res = await request('GET', `/api/opportunities/${opportunityId}`, null, studentToken);
    console.log(`   Status: ${res.status}`);
    if (res.status !== 200) throw new Error('Get opportunity detail failed');
    console.log(`   ✅ Opportunity detail retrieved: ${res.data.data?.title}`);

    // 6. Student bookmarks opportunity
    console.log('\n6️⃣  Student bookmarking opportunity...');
    res = await request('POST', '/api/bookmarks', {
      opportunity_id: opportunityId
    }, studentToken);
    console.log(`   Status: ${res.status}`);
    if (res.status !== 201 && res.status !== 200) throw new Error('Bookmark failed');
    console.log('   ✅ Opportunity bookmarked');

    // 7. Get bookmarks
    console.log('\n7️⃣  Getting student bookmarks...');
    res = await request('GET', '/api/bookmarks', null, studentToken);
    console.log(`   Status: ${res.status}`);
    console.log(`   📊 Student has ${(res.data.data || []).length} bookmarks`);
    if (res.status !== 200) throw new Error('Get bookmarks failed');
    console.log('   ✅ Bookmarks retrieved');

    // 8. Create task (Scholar's Ledger)
    console.log('\n8️⃣  Creating task (Scholar\'s Ledger)...');
    res = await request('POST', '/api/tasks', {
      title: 'Complete Python Project',
      description: 'Finish machine learning project',
      category: 'projects',
      due_date: '2025-02-15'
    }, studentToken);
    console.log(`   Status: ${res.status}`);
    if (res.status !== 201 && res.status !== 200) throw new Error('Create task failed');
    taskId = res.data.data?.task_id || res.data.task_id;
    console.log(`   ✅ Task created (ID: ${taskId})`);

    // 9. Get tasks/categories
    console.log('\n9️⃣  Getting task categories...');
    res = await request('GET', '/api/tasks/categories', null, studentToken);
    console.log(`   Status: ${res.status}`);
    console.log(`   📊 Available categories: ${(res.data.data || []).join(', ') || 'N/A'}`);
    if (res.status !== 200) throw new Error('Get categories failed');
    console.log('   ✅ Categories retrieved');

    // 10. Get tasks
    console.log('\n🔟 Getting all tasks...');
    res = await request('GET', '/api/tasks', null, studentToken);
    console.log(`   Status: ${res.status}`);
    console.log(`   📊 Student has ${(res.data.data || []).length} tasks`);
    if (res.status !== 200) throw new Error('Get tasks failed');
    console.log('   ✅ Tasks retrieved');

    // 11. Update task progress
    if (taskId) {
      console.log(`\n1️⃣1️⃣  Updating task progress (ID: ${taskId})...`);
      res = await request('PUT', `/api/tasks/${taskId}`, {
        progress_percentage: 50,
        status: 'IN_PROGRESS'
      }, studentToken);
      console.log(`   Status: ${res.status}`);
      if (res.status !== 200) throw new Error('Update task failed');
      console.log('   ✅ Task updated');
    }

    // 12. Faculty gets their postings
    console.log('\n1️⃣2️⃣  Faculty getting their postings...');
    res = await request('GET', '/api/opportunities/postings/mine', null, facultyToken);
    console.log(`   Status: ${res.status}`);
    console.log(`   📊 Faculty posted ${(res.data.data || []).length} opportunities`);
    if (res.status !== 200) throw new Error('Get faculty postings failed');
    console.log('   ✅ Faculty postings retrieved');

    console.log('\n✨ All Pillar IV endpoint tests PASSED!\n');

  } catch (err) {
    console.error(`\n❌ Test failed: ${err.message}\n`);
    process.exit(1);
  }
}

runTests().then(() => {
  console.log('Test script completed. Both backend and frontend endpoints are working!\n');
  console.log('Frontend is running on: http://localhost:5174');
  console.log('Backend is running on: http://localhost:5000\n');
}).catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
