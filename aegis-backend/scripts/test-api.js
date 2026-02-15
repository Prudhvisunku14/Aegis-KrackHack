const http = require('http');

function req(options, data) {
  return new Promise((resolve, reject) => {
    const r = http.request(options, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    r.on('error', reject);
    if (data) r.write(JSON.stringify(data));
    r.end();
  });
}

(async () => {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzdHVkZW50MUBpaXRtYW5kaS5hYy5pbiIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzcxMDg2MTQ0LCJleHAiOjE3NzExMTQ5NDR9.2p0wd2hIVFEDxLmExv73IriMbSNT4klayG9InLP6svU';

    console.log('GET /api/users');
    const users = await req({ hostname: 'localhost', port: 5000, path: '/api/users', method: 'GET', headers: { Authorization: 'Bearer ' + token } });
    console.log(users.status, users.body);

    console.log('\nPOST /api/grievances');
    const grievance = await req({ hostname: 'localhost', port: 5000, path: '/api/grievances', method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } }, {
      title: 'Broken lamp',
      description: 'Streetlamp near hostel not working',
      category: 'Hostel',
      priority: 'Medium',
      location: 'Hostel Block A',
      anonymous: false
    });
    console.log(grievance.status, grievance.body);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
