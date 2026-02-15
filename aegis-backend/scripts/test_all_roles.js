// Comprehensive Role-Based Testing Script
const BASE_URL = 'https://aegis-krackhack.onrender.com/api';

const roles = {
  Student: {
    email: 'priya.singh@aegis.edu',
    password: 'aegis@2025',
    endpoints: [
      'opportunities',
      'opportunities/1',
      'applications',
      'bookmarks',
      'tasks',
      'academic/resources',
      'academic/courses',
      'users/profile',
      'grievances'
    ]
  },
  Faculty: {
    email: 'rajesh.kumar@aegis.edu',
    password: 'aegis@2025',
    endpoints: [
      'opportunities',
      'tasks',
      'academic/courses',
      'academic/enrollments',
      'users/profile',
      'academic/events',
      'courses',
      'enrollments'
    ]
  },
  Admin: {
    email: 'admin@aegis.edu',
    password: 'aegis@2025',
    endpoints: [
      'admin/users',
      'admin/grievances',
      'users',
      'grievances',
      'opportunities',
      'applications',
      'courses',
      'tasks'
    ]
  }
};

async function login(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      console.log(`  ❌ Login failed: ${response.status} - ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.log(`  ❌ Login failed: ${error.message}`);
    return null;
  }
}

async function testEndpoint(url, token) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    const isArray = Array.isArray(data);
    const count = isArray ? data.length : (data ? 1 : 0);
    
    return {
      status: '✅',
      code: response.status,
      count: count,
      data: data
    };
  } catch (error) {
    return {
      status: '❌',
      code: 'Network Error',
      error: error.message
    };
  }
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🔬 AEGIS COMPREHENSIVE ROLE-BASED TESTING');
  console.log('='.repeat(70) + '\n');

  for (const [role, creds] of Object.entries(roles)) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`👤 Testing as ${role.toUpperCase()}`);
    console.log('='.repeat(70));

    // LOGIN TEST
    console.log('\n🔐 LOGIN TEST');
    console.log(`  Email: ${creds.email}`);
    
    const token = await login(creds.email, creds.password);
    
    if (!token) {
      console.log(`  ⚠️  SKIPPING ENDPOINT TESTS - Login failed\n`);
      continue;
    }
    
    console.log(`  ✅ Login successful`);
    console.log(`  Token: ${token.substring(0, 20)}...`);

    // ENDPOINT TESTS
    console.log(`\n📡 ENDPOINT TESTS (${creds.endpoints.length} total)`);
    
    let working = 0;
    let failing = 0;

    for (const endpoint of creds.endpoints) {
      const url = `${BASE_URL}/${endpoint}`;
      process.stdout.write(`  GET /${endpoint}`.padEnd(40));
      
      const result = await testEndpoint(url, token);
      
      if (result.status === '✅') {
        console.log(`${result.status} [${result.code}] ${result.count} items`);
        working++;
      } else {
        console.log(`${result.status} [${result.code}] ${result.error}`);
        failing++;
      }
    }

    console.log(`\n  📊 Summary: ${working}/${creds.endpoints.length} working`);
    if (failing > 0) {
      console.log(`  ⚠️  ${failing} endpoints failing`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Testing Complete!');
  console.log('='.repeat(70) + '\n');
}

main().catch(console.error);
