// scripts/benchmark-all.js
const BASE_URL = process.argv[2] || 'https://el-kholasa.online';

async function request(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : BASE_URL + url;
  const start = performance.now();
  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BenchmarkSpeed/1.0',
        ...(options.headers || {}),
      },
      redirect: 'manual'
    });
    const duration = Math.round(performance.now() - start);
    const text = await res.text();
    const gzip = res.headers.get('content-encoding') || 'none';
    const cache = res.headers.get('cache-control') || 'none';
    const setCookie = res.headers.get('set-cookie');
    const location = res.headers.get('location');

    return {
      url,
      status: res.status,
      durationMs: duration,
      sizeBytes: text.length,
      gzip,
      cache: cache.slice(0, 35),
      location: location || '',
      setCookie,
      rawHeaders: Object.fromEntries(res.headers.entries())
    };
  } catch (err) {
    return {
      url,
      status: 'ERR',
      durationMs: Math.round(performance.now() - start),
      error: err.message
    };
  }
}

async function main() {
  console.log(`\n======================================================`);
  console.log(`🚀 COMPREHENSIVE SPEED & PERFORMANCE AUDIT`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`======================================================\n`);

  // 1. PUBLIC ROUTES
  console.log('--- 1. Public Pages ---');
  const publicRoutes = [
    '/',
    '/login',
    '/subscription',
    '/privacy',
    '/terms',
    '/api/systems',
    '/api/search?q=math'
  ];

  const publicResults = [];
  for (const r of publicRoutes) {
    const res = await request(r);
    publicResults.push({
      Path: r,
      Status: res.status,
      Latency: `${res.durationMs}ms`,
      Gzip: res.gzip,
      Size: `${(res.sizeBytes / 1024).toFixed(1)} KB`,
      Cache: res.cache,
    });
  }
  console.table(publicResults);

  // 2. STUDENT AUTHENTICATION & ROUTES
  console.log('\n--- 2. Student Authentication & Routes ---');
  const studentLoginRes = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: 'DEMO-EN',
      deviceId: 'benchmark-tester-device-01',
      studyMode: 'OFFLINE',
    }),
  });

  console.log(`Student Login (Code DEMO-EN): Status ${studentLoginRes.status} in ${studentLoginRes.durationMs}ms`);

  let studentCookie = '';
  if (studentLoginRes.setCookie) {
    studentCookie = studentLoginRes.setCookie.split(';')[0];
  }

  const studentHeaders = studentCookie ? { Cookie: studentCookie } : {};
  const studentRoutes = [
    '/dashboard',
    '/subjects',
    '/exams',
    '/exams/builder',
    '/leaderboard',
    '/api/auth/me',
  ];

  const studentResults = [];
  for (const r of studentRoutes) {
    const res = await request(r, { headers: studentHeaders });
    studentResults.push({
      Path: r,
      Status: res.status,
      Latency: `${res.durationMs}ms`,
      Gzip: res.gzip,
      Size: `${(res.sizeBytes / 1024).toFixed(1)} KB`,
      Location: res.location || '-',
    });
  }
  console.table(studentResults);

  // 3. ADMIN AUTHENTICATION & ROUTES
  console.log('\n--- 3. Admin Authentication & Routes ---');
  const adminLoginRes = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'admin@kholasa.app',
      password: 'Admin@Kholasa2026!',
    }),
  });

  console.log(`Admin Login: Status ${adminLoginRes.status} in ${adminLoginRes.durationMs}ms`);

  let adminCookie = '';
  if (adminLoginRes.setCookie) {
    adminCookie = adminLoginRes.setCookie.split(';')[0];
  }

  const adminHeaders = adminCookie ? { Cookie: adminCookie } : {};
  const adminRoutes = [
    '/admin',
    '/admin/users',
    '/admin/questions',
    '/admin/analytics',
    '/admin/exams',
    '/api/admin/questions?page=1&limit=10',
    '/api/admin/analytics/realtime',
  ];

  const adminResults = [];
  for (const r of adminRoutes) {
    const res = await request(r, { headers: adminHeaders });
    adminResults.push({
      Path: r,
      Status: res.status,
      Latency: `${res.durationMs}ms`,
      Gzip: res.gzip,
      Size: `${(res.sizeBytes / 1024).toFixed(1)} KB`,
      Location: res.location || '-',
    });
  }
  console.table(adminResults);

  // 4. STATIC ASSET CACHING & COMPRESSION
  console.log('\n--- 4. Static Asset Caching Check ---');
  const homeRes = await request('/login');
  const match = homeRes.rawHeaders ? (await fetch(BASE_URL + '/login')).text() : '';
  const html = await (await fetch(BASE_URL + '/login')).text();
  const chunkMatch = html.match(/\/_next\/static\/chunks\/[a-zA-Z0-9_\-\.]+\.(?:js|css)/);
  if (chunkMatch) {
    const chunkUrl = chunkMatch[0];
    const chunkRes = await request(chunkUrl);
    console.log(`Static Asset (${chunkUrl}):`);
    console.log(`  - Status: ${chunkRes.status}`);
    console.log(`  - Latency: ${chunkRes.durationMs}ms`);
    console.log(`  - Compression: ${chunkRes.gzip}`);
    console.log(`  - Cache-Control: ${chunkRes.rawHeaders?.['cache-control']}`);
  }

  console.log('\n======================================================');
  console.log('✅ AUDIT COMPLETE');
  console.log('======================================================\n');
}

main().catch(console.error);
