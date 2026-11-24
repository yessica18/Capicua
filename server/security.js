/**
 * CAPICÚA 888 — Security & Cryptography Layer
 * OWASP Compliant Headers, Sliding-Window Rate Limiter & PBKDF2 Password Hashing
 */
const crypto = require('crypto');
const config = require('./config');

// In-memory sliding window rate limiter
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = config.security.rateLimitWindowMs;
  const maxReqs = config.security.rateLimitMax;

  let record = rateLimitMap.get(ip);
  if (!record || now - record.startTime > windowMs) {
    record = { startTime: now, count: 1 };
    rateLimitMap.set(ip, record);
    return { allowed: true, remaining: maxReqs - 1 };
  }

  record.count++;
  if (record.count > maxReqs) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxReqs - record.count };
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.startTime > config.security.rateLimitWindowMs * 2) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// OWASP Security Headers
function applySecurityHeaders(res, isHtml = false) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (config.env === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  if (isHtml) {
    // Content Security Policy adapted for Three.js WebGL, KaTeX KaTeX, and Google Fonts
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com data:; " +
      "img-src 'self' data: blob: https:; " +
      "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://checkout.wompi.co https://production.wompi.co https://sandbox.wompi.co; " +
      "media-src 'self' blob:; " +
      "worker-src 'self' blob:;"
    );
  }
}

// Cryptographically secure password hash (PBKDF2 with SHA-512, 100,000 rounds)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2$100000$${salt}$${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.startsWith('pbkdf2$')) {
    // Legacy migration check
    return false;
  }
  const parts = storedHash.split('$');
  const iterations = parseInt(parts[1], 10);
  const salt = parts[2];
  const originalHash = parts[3];
  const testHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(testHash, 'hex'));
}

// Sanitize string against XSS
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

module.exports = {
  checkRateLimit,
  applySecurityHeaders,
  hashPassword,
  verifyPassword,
  sanitizeInput
};
