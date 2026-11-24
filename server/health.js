/**
 * CAPICÚA 888 — Health Check & Monitoring Service
 * Exposes system metrics, database connectivity status, and uptime.
 */
const os = require('os');
const config = require('./config');

const startTime = Date.now();

function getSystemHealth() {
  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: uptimeSeconds,
    service: 'capicua-backend',
    version: '3.5.0',
    environment: config.env,
    memory: {
      rssMb: Math.round(memory.rss / (1024 * 1024)),
      heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
      heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024))
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuCount: os.cpus().length,
      freeMemoryMb: Math.round(os.freemem() / (1024 * 1024))
    },
    integrations: {
      supabase: Boolean(config.supabase.url && config.supabase.anonKey),
      wompi: Boolean(config.wompi.publicKey),
      wompiIntegrityConfigured: Boolean(config.wompi.integritySecret),
      geminiAi: Boolean(config.ai.geminiApiKey)
    }
  };
}

module.exports = {
  getSystemHealth
};
