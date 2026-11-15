// ============================================================================
// CAPICÚA 888 — API Endpoints Test Suite
// Verifies HTTP Gateway Native API Endpoints
// ============================================================================
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const config = require('../lib/config');

const PORT = config.port || 8088;

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '127.0.0.' + Math.floor(Math.random() * 200 + 10), // bypass IP rate limit in tests
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, headers: res.headers, body: JSON.parse(raw) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, headers: res.headers, body: raw });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

test('API Endpoints — GET /api/health', async () => {
  const res = await makeRequest('/api/health');
  assert.strictEqual(res.statusCode, 200, 'Health check must return 200 OK');
  assert.strictEqual(res.body.status, 'healthy', 'Status should be healthy');
  assert.ok(res.body.uptime >= 0, 'Uptime must be reported');
  assert.ok(res.body.memory, 'Memory metrics must be present');
  assert.ok(res.body.integrations, 'Integrations status must be present');
});

test('API Endpoints — POST /api/capi-ask (Pedagogical Modes & Transparency)', async () => {
  const payload = {
    message: 'Hola Capi, explica el producto notable (a+b)^2 con geometría de Baldor',
    studentName: 'Mateo',
    level: 2,
    mode: 'resolver',
    courseContext: 'algebra-baldor-geom',
    history: []
  };

  const res = await makeRequest('/api/capi-ask', 'POST', payload);
  assert.strictEqual(res.statusCode, 200, 'Capi Ask must return 200 OK');
  assert.strictEqual(res.body.ok, true, 'Response must have ok=true');
  assert.strictEqual(res.body.mode, 'resolver', 'Mode must be preserved');
  assert.ok(typeof res.body.text === 'string', 'Reply text must be a string');
  assert.ok(res.body.text.length > 0, 'Reply text must not be empty');

  // Strict transparency verification: if offline or without key, must honestly disclose offline status
  if (!config.ai.geminiApiKey) {
    assert.strictEqual(res.body.source, 'offline-notice', 'Without key, source must be offline-notice');
    assert.strictEqual(res.body.offline, true, 'Without key, offline must be true');
    assert.match(res.body.text, /En este momento no puedo conectarme a mi sistema de inteligencia artificial/, 'Must show exact transparency text');
    assert.ok(res.body.localFallback, 'Local pedagogical guidance must be present');
  }
});

test('API Endpoints — POST /api/payment-checkout', async () => {
  const payload = {
    planId: 'chispa',
    period: 'annual',
    userEmail: 'estudiante.test@capicua.com',
    userId: 'uuid-test-999'
  };

  const res = await makeRequest('/api/payment-checkout', 'POST', payload);
  assert.strictEqual(res.statusCode, 200, 'Checkout creation must return 200 OK');
  assert.strictEqual(res.body.ok, true, 'Checkout must have ok=true');
  assert.ok(res.body.reference, 'Must provide payment reference');
  assert.ok(res.body.wompi.signature, 'Must provide integrity signature');
});
