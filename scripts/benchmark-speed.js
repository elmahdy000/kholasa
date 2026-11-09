// scripts/benchmark-speed.js
const routes = [
  '/',
  '/login',
  '/subscription',
  '/subjects',
  '/exams',
  '/leaderboard',
  '/privacy',
  '/terms',
  '/api/search?q=test',
  '/api/systems'
];

async function measure(baseUrl, url) {
  const start = performance.now();
  try {
    const res = await fetch(baseUrl + url, {
      headers: { 'Accept-Encoding': 'gzip' }
    });
    const duration = Math.round(performance.now() - start);
    const text = await res.text();
    const gzip = res.headers.get('content-encoding') || 'none';
    const cache = res.headers.get('cache-control') || 'none';
    return {
      url,
      status: res.status,
      durationMs: duration,
      sizeBytes: text.length,
      gzip,
      cache: cache.slice(0, 35)
    };
  } catch (err) {
    return { url, error: err.message };
  }
}

async function run() {
  const baseUrl = process.argv[2] || 'https://el-kholasa.online';
  console.log(`\n=== Testing Speed & Performance on: ${baseUrl} ===\n`);
  const results = [];
  for (const r of routes) {
    const res = await measure(baseUrl, r);
    results.push(res);
  }
  console.table(results);
}

run();

