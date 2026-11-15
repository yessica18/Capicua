/**
 * =====================================================================
 * CAPICÚA 888 — Servidor Profesional Full-Stack & API Gateway
 * Versión: 3.5.0 Enterprise
 * =====================================================================
 * • Servidor HTTP nativo con compresión GZIP y cabeceras OWASP
 * • Enrutador de API REST para Pagos Wompi, IA Capi y Salud
 * • Limitador de tasa (Rate Limiting) y mitigación de ataques
 * • Gestión de errores y apagado ordenado (Graceful Shutdown)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const config = require('./lib/config');
const security = require('./lib/security');
const payments = require('./lib/payments');
const ai = require('./lib/ai');
const health = require('./lib/health');

const PORT = config.port;
const BASE_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8'
};

// Helper: parse JSON body from incoming request
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Protection against massive payload flooding (> 2MB)
      if (body.length > 2 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload demasiado grande'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('JSON malformado'));
      }
    });
    req.on('error', reject);
  });
}

// Helper: Send JSON response with status and CORS
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // 1. Rate Limiting Check
  const rateLimit = security.checkRateLimit(clientIp);
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
  if (!rateLimit.allowed) {
    sendJson(res, 429, { error: 'Límite de solicitudes excedido. Intenta más tarde.' });
    return;
  }

  // 2. Preflight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURI(parsedUrl.pathname);

  // 3. API ROUTING
  // -------------------------------------------------------------
  // Health check
  if (pathname === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, health.getSystemHealth());
    return;
  }

  // Payment checkout (Wompi)
  if ((pathname === '/api/payment-checkout' || pathname === '/.netlify/functions/payment-checkout') && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const session = payments.createCheckoutSession(payload);
      sendJson(res, 200, session);
    } catch (err) {
      sendJson(res, 400, { ok: false, error: err.message });
    }
    return;
  }

  // Payment webhook (Wompi notification)
  if ((pathname === '/api/payment-webhook' || pathname === '/.netlify/functions/payment-webhook') && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const result = payments.verifyWebhook(payload);
      sendJson(res, 200, result);
    } catch (err) {
      sendJson(res, 400, { ok: false, error: err.message });
    }
    return;
  }

  // Capi IA Ask proxy
  if ((pathname === '/api/capi-ask' || pathname === '/.netlify/functions/capi-ask') && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const answer = await ai.askCapi(payload);
      sendJson(res, 200, answer);
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // 4. STATIC FILE SERVING
  // -------------------------------------------------------------
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.normalize(path.join(BASE_DIR, reqPath));

  // Security check: ensure path is inside BASE_DIR
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Acceso denegado');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    // If not found, serve 404.html if available or custom 404
    if (err || !stats.isFile()) {
      const notFoundPath = path.join(BASE_DIR, '404.html');
      if (fs.existsSync(notFoundPath)) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(notFoundPath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 No Encontrado - CAPICÚA 888');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isHtml = ext === '.html';

    // Apply OWASP headers
    security.applySecurityHeaders(res, isHtml);

    // Cache-Control headers
    const cacheControl = (ext === '.png' || ext === '.jpg' || ext === '.ico' || ext === '.woff2')
      ? 'public, max-age=86400, stale-while-revalidate=604800'
      : 'no-cache, must-revalidate';

    const acceptEncoding = req.headers['accept-encoding'] || '';
    const canGzip = isHtml || ext === '.js' || ext === '.css' || ext === '.json' || ext === '.svg' || ext === '.xml';

    if (canGzip && acceptEncoding.includes('gzip')) {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Encoding': 'gzip',
        'Cache-Control': cacheControl,
        'Access-Control-Allow-Origin': '*'
      });
      const rawStream = fs.createReadStream(filePath);
      const gzipStream = zlib.createGzip({ level: 6 });
      rawStream.pipe(gzipStream).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

// Graceful Shutdown
function gracefulShutdown(signal) {
  console.log(`\n[CAPICÚA] Señal ${signal} recibida. Cerrando conexiones de forma ordenada...`);
  server.close(() => {
    console.log('[CAPICÚA] Servidor detenido de forma segura.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('[CAPICÚA] Forzando detención por tiempo límite.');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => console.error('[CAPICÚA FATAL] Error no capturado:', err));
process.on('unhandledRejection', (reason) => console.warn('[CAPICÚA WARN] Promesa rechazada no manejada:', reason));

server.listen(PORT, config.host, () => {
  const url = `http://localhost:${PORT}`;
  console.log('====================================================');
  console.log(`  CAPICÚA 888 — PLATAFORMA EDUCATIVA ENTERPRISE`);
  console.log(`  Estado:      EN LÍNEA (HEALTHY)`);
  console.log(`  Servidor:    ${url}`);
  console.log(`  API Health:  ${url}/api/health`);
  console.log(`  Entorno:     ${config.env}`);
  console.log('====================================================');
});

module.exports = server;
