// Family Finance Hub PWA Service Worker
// Caches app shell on install; serves shell from cache with network fallback.
// Vite-hashed JS/CSS assets use stale-while-revalidate so the app boots
// instantly even offline and silently updates in the background.
const SHELL_CACHE = 'ffh-shell-v2';
const ASSET_CACHE = 'ffh-assets-v2';

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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip Firebase, auth, and cross-origin requests — let Firestore SDK handle them
  if (url.origin !== self.location.origin) return;

  // Vite hashed assets (/assets/*.js, /assets/*.css) → stale-while-revalidate
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(staleWhileRevalidate(ASSET_CACHE, event.request));
    return;
  }

  // App shell & navigation → cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful HTML navigations for offline shell
        if (response.ok && (event.request.mode === 'navigate' || url.pathname.endsWith('.html'))) {
          caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, response.clone()));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    }),
  );
});

async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || await networkFetch;
}
