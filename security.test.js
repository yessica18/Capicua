// ============================================================================
// CAPICÚA 888 — Security Module Test Suite
// Verifies PBKDF2 Password Hashing, Input Sanitization & Rate Limiting
// ============================================================================
const test = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword, sanitizeInput, checkRateLimit } = require('../lib/security');
const config = require('../lib/config');

test('Security Module — PBKDF2 Password Hashing & Verification', () => {
  const plainText = 'CapiSuperSecretPassword2026!';
  const hash = hashPassword(plainText);

  assert.ok(hash, 'Hash should not be empty');
  assert.match(hash, /^pbkdf2\$100000\$[a-f0-9]+\$[a-f0-9]+$/, 'Hash must follow standard PBKDF2 format (pbkdf2$iterations$salt$hash)');

  // Positive verification
  const isValid = verifyPassword(plainText, hash);
  assert.strictEqual(isValid, true, 'Valid password must verify as true');

  // Negative verification (wrong password)
  const isInvalid = verifyPassword('WrongPassword123', hash);
  assert.strictEqual(isInvalid, false, 'Invalid password must verify as false');
});

test('Security Module — Input Sanitization against XSS', () => {
  const dirty = '<script>alert("XSS")</script><b>Hola</b> "comillas" & \'apóstrofe\'';
  const clean = sanitizeInput(dirty);

  assert.ok(!clean.includes('<script>'), 'Must strip or escape <script>');
  assert.ok(clean.includes('&lt;script&gt;'), 'Must encode angle brackets');
  assert.ok(clean.includes('&quot;'), 'Must encode double quotes');
  assert.ok(clean.includes('&#x27;'), 'Must encode single quotes');
  assert.ok(clean.includes('&amp;'), 'Must encode ampersand');
});

test('Security Module — Sliding-Window Rate Limiter', () => {
  const testIp = '10.254.254.99';
  const maxReqs = config.security.rateLimitMax;

  // Initial requests within limit
  let lastRes = null;
  for (let i = 0; i < maxReqs; i++) {
    lastRes = checkRateLimit(testIp);
    assert.strictEqual(lastRes.allowed, true, `Request ${i + 1} must be allowed`);
  }

  // Request exceeding limit
  const blocked = checkRateLimit(testIp);
  assert.strictEqual(blocked.allowed, false, 'Request exceeding max must be blocked');
  assert.strictEqual(blocked.remaining, 0, 'Remaining should be 0');
});
