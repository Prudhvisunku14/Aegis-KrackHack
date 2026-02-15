// Updated Comprehensive Role-Based Testing Script - AFTER FIXES
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
      'academic_resources/search',
      'courses',
      'auth/me',
      'grievances'
    ]
  },
  Faculty: {
    email: 'rajesh.kumar@aegis.edu',
    password: 'aegis@2025',
    endpoints: [
      'opportunities',
      'tasks',
      'courses',
      'enrollments',
      'auth/me',
      'academic_events',
      'academic_resources/search'
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
      return null;
    }
    
    const data = await response.json();
    return data.token;
  } catch (error) {
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
    
    const isArray = Array.isArray(data?.data) || Array.isArray(data?.grievances) || Array.isArray(data?.users) || Array.isArray(data);
    const arrayData = data?.data || data?.grievances || data?.users || (Array.isArray(data) ? data : null);
    const count = isArray && arrayData ? arrayData.length : (data ? 1 : 0);
    
    return {
      status: '✅',
      code: response.status,
      count: count,
      working: response.status === 200 || response.status === 201
    };
  } catch (error) {
    return {
      status: '❌',
      code: 'Network Error',
      error: error.message,
      working: false
    };
  }
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🔬 AEGIS COMPREHENSIVE TESTING - AFTER FIXES');
  console.log('='.repeat(70) + '\n');

  const results = {};

  for (const [role, creds] of Object.entries(roles)) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`👤 Testing as ${role.toUpperCase()}`);
    console.log('='.repeat(70));

    console.log('\n🔐 LOGIN TEST');
    console.log(`  Email: ${creds.email}`);
    
    const token = await login(creds.email, creds.password);
    
    if (!token) {
      console.log(`  ❌ Login failed\n`);
      results[role] = { login: false, endpoints: 0, working: 0 };
      continue;
    }
    
    console.log(`  ✅ Login successful`);

    console.log(`\n📡 ENDPOINT TESTS (${creds.endpoints.length} total)`);
    
    let working = 0;
    let failing = 0;

    for (const endpoint of creds.endpoints) {
      const url = `${BASE_URL}/${endpoint}`;
      process.stdout.write(`  GET /${endpoint}`.padEnd(50));
      
      const result = await testEndpoint(url, token);
      
      if (result.working) {
        console.log(`${result.status} [${result.code}] ${result.count} items`);
        working++;
      } else {
        console.log(`${result.status} [${result.code}]`);
        failing++;
      }
    }

    console.log(`\n  📊 Summary: ${working}/${creds.endpoints.length} working (${Math.round(working/creds.endpoints.length*100)}%)`);
    
    results[role] = { 
      login: true, 
      endpoints: creds.endpoints.length,
      working: working,
      failing: failing,
      percentage: Math.round(working/creds.endpoints.length*100)
    };

    if (failing > 0) {
      console.log(`  ⚠️  ${failing} endpoints failing`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL TEST SUMMARY');
  console.log('='.repeat(70) + '\n');
  
  let totalEndpoints = 0;
  let totalWorking = 0;
  
  for (const [role, data] of Object.entries(results)) {
    const bar = '█'.repeat(data.percentage / 5) + '░'.repeat(20 - (data.percentage / 5));
    console.log(`${role.padEnd(10)} │ ${bar} │ ${data.percentage}% (${data.working}/${data.endpoints})`);
    totalEndpoints += data.endpoints;
    totalWorking += data.working;
  }
  
  const overallPercentage = Math.round(totalWorking / totalEndpoints * 100);
  const overallBar = '█'.repeat(overallPercentage / 5) + '░'.repeat(20 - (overallPercentage / 5));
  console.log(`${'Overall'.padEnd(10)} │ ${overallBar} │ ${overallPercentage}% (${totalWorking}/${totalEndpoints})`);
  
  console.log('\n' + '='.repeat(70));
  if (overallPercentage === 100) {
    console.log('✅ ALL TESTS PASSED! Backend is fully operational.');
  } else if (overallPercentage >= 90) {
    console.log('✅ TESTS PASSED with minor issues. Backend is mostly operational.');
  } else {
    console.log('⚠️  TESTS FAILED. Check endpoints and authentication.');
  }
  console.log('='.repeat(70) + '\n');
}

main().catch(console.error);
