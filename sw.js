// ==========================================================================
// CAPICÚA 888 — Service Worker Inmortal (Cache-First + Offline Resiliente)
// Garantiza que la aplicación funcione siempre, incluso sin conexión o tras meses.
// ==========================================================================
const CACHE_VERSION = 'capicua-v3.6-enterprise';

const CORE_ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'favicon.ico',
  'favicon.png',
  'capi-logo.png',
  'capi-logo.jpg',
  'vendor/three.min.js',
  'script-3d.js',
  'script.js',
  'script-extra.js',
  'capicua-master.css',
  'capicua-master.js',
  'capicua-victory.js',
  'capicua-simulacros.js',
  'capicua-members.css',
  'capicua-members.js',
  'capicua-plus.css',
  'capicua-plus.js',
  'capicua-final.css',
  'capicua-final.js',
  'capicua-extras.js',
  'capicua-supabase.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return Promise.all(
        CORE_ASSETS.map((url) => {
          return fetch(url, { cache: 'no-cache' })
            .then((res) => {
              if (res.ok) return cache.put(url, res);
            })
            .catch((err) => console.warn('[SW] Precache skipped for:', url, err));
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip caching for external dynamic API endpoints
  if (url.pathname.includes('/api/') || url.pathname.includes('/rt')) return;

  // Navigation requests: Serve cached index.html immediately, then revalidate
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('index.html').then((cachedIndex) => {
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.ok) {
            const clone = networkRes.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put('index.html', clone));
          }
          return networkRes;
        }).catch(() => cachedIndex);

        return cachedIndex || fetchPromise;
      })
    );
    return;
  }

  // Same-origin assets or trusted CDNs: Cache-First with Network fallback
  const isCacheable = url.origin === location.origin ||
    /fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/.test(url.host);

  if (isCacheable) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background
          fetch(req).then((networkRes) => {
            if (networkRes && networkRes.ok) {
              caches.open(CACHE_VERSION).then((cache) => cache.put(req, networkRes));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(req).then((networkRes) => {
          if (networkRes && (networkRes.ok || networkRes.type === 'opaque')) {
            const clone = networkRes.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        }).catch(() => {
          // Fallback for missing images/assets
          if (req.destination === 'image') {
            return caches.match('capi-logo.png');
          }
        });
      })
    );
  }
});
