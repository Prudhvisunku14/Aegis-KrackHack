// Simple debug script for testing Pillar IV
// Run: node -r dotenv/config scripts/simple_test.js

const http = require('http');

const API_BASE = 'http://localhost:5000';

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

async function run() {
  try {
    console.log('\n=== Testing Pillar IV Simple ===\n');

    // Register faculty
    console.log('1. Registering faculty...');
    const facultyEmail = `fac_${Date.now()}@iitmandi.ac.in`;
    let res = await request('POST', '/api/auth/register', {
      email: facultyEmail,
      password: 'Test123!',
      name: 'Faculty Test',
      role: 'faculty'
    });
    console.log('Response:', res.status, JSON.stringify(res.data, null, 2));
    
    if (res.status !== 201) throw new Error('Register faculty failed: ' + res.data.message);
    const facultyToken = res.data.token;
    console.log('✅ Faculty registered, token:', facultyToken.substring(0, 20) + '...\n');

    // Post opportunity
    console.log('2. Faculty posting opportunity...');
    res = await request('POST', '/api/opportunities', {
      title: 'Summer Internship',
      description: 'Great opportunity',
      required_skills: 'Python, ML',
      duration: '3 months',
      stipend: '10000',
      deadline: '2025-02-28'
    }, facultyToken);
    console.log('Response:', res.status, JSON.stringify(res.data, null, 2));
    
    if (res.status !== 201 && res.status !== 200) throw new Error('Post opportunity failed');
    console.log('✅ Opportunity posted\n');

    // List opportunities
    console.log('3. Getting opportunities list...');
    res = await request('GET', '/api/opportunities', null, facultyToken);
    console.log('Response:', res.status);
    console.log('Data length:', res.data.data ? res.data.data.length : 'N/A');
    console.log('✅ List retrieved\n');

    console.log('✨ All tests passed!');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

run();
