// Family Finance Hub PWA Service Worker (v3)
// 1. Navigation (HTML): Network-First with cache fallback so deployments update immediately.
// 2. Assets (/assets/*): Cache-First, strictly guarding against HTML fallback rewrites.
// 3. Icons / Manifest: Stale-While-Revalidate for instant startup.
const SHELL_CACHE = 'ffh-shell-v3';
const ASSET_CACHE = 'ffh-assets-v3';

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip cross-origin requests (Firebase, Google Fonts, etc.) — let browser/SDK handle them
  if (url.origin !== self.location.origin) return;

  // 1. Navigation requests (HTML documents): NETWORK-FIRST
  // Guarantees that any new deployment is picked up immediately when online.
  if (event.request.mode === 'navigate' || event.request.destination === 'document' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          // Offline fallback: serve cached shell
          const cached = await caches.match(event.request);
          return cached || caches.match('/index.html');
        }),
    );
    return;
  }

  // 2. Vite hashed assets (/assets/*.js, /assets/*.css): CACHE-FIRST
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then(async (cached) => {
        if (cached) return cached;
        try {
          const response = await fetch(event.request);
          const contentType = response.headers.get('content-type') || '';
          // CRITICAL: Never cache text/html for a JS/CSS file (happens when missing assets hit SPA rewrite)
          const isHtmlFallback = contentType.includes('text/html');
          if (response && response.status === 200 && !isHtmlFallback) {
            const copy = response.clone();
            const cache = await caches.open(ASSET_CACHE);
            cache.put(event.request, copy);
          }
          return response;
        } catch {
          return cached || new Response('Asset unavailable offline', { status: 503 });
        }
      }),
    );
    return;
  }

  // 3. Static icons, manifest: STALE-WHILE-REVALIDATE
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => null);
      return cached || networkFetch;
    }),
  );
});
