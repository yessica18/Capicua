/**
 * CAPICÚA 888 — Centralized Configuration Service
 * Reads and validates environment variables from .env or system environment.
 */
const fs = require('fs');
const path = require('path');

// Simple zero-dependency .env parser
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const idx = line.indexOf('=');
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

loadEnv();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8088', 10),
  host: process.env.HOST || '0.0.0.0',
  appUrl: process.env.APP_URL || 'https://capicua.com',

  // Supabase (PostgreSQL Cloud)
  supabase: {
    url: process.env.SUPABASE_URL || process.env.CAPICUA_SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.CAPICUA_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },

  // Wompi Pasarela Oficial (Colombia)
  wompi: {
    publicKey: process.env.WOMPI_PUBLIC_KEY || 'pub_test_capicua_demo',
    privateKey: process.env.WOMPI_PRIVATE_KEY || '',
    integritySecret: process.env.WOMPI_INTEGRITY_SECRET || 'prod_integrity_mock_secret_enterprise_2026',
    eventsSecret: process.env.WOMPI_EVENTS_SECRET || 'prod_events_mock_secret_enterprise_2026',
    sandbox: process.env.WOMPI_SANDBOX !== 'false'
  },

  // IA y Asistente Capi
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || ''
  },

  // Seguridad
  security: {
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '120', 10), // reqs per minute
    rateLimitWindowMs: 60 * 1000,
    corsOrigins: (process.env.CORS_ORIGINS || 'https://capicua.com,https://www.capicua.com,http://localhost:8088,http://localhost:3000').split(',')
  }
};

module.exports = config;
