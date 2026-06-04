const CACHE_NAME = 'nexofluye-v1';
const OFFLINE_URL = '/offline.html';

// Archivos del app shell que se cachean al instalar
const APP_SHELL = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// ── Instalación: cachea el app shell ──────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activación: elimina caches viejos ─────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: estrategia según tipo de recurso ───────────────────────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Recursos externos (CDN, APIs) → network only
  if (url.origin !== self.location.origin) return;

  // Archivos JS, CSS, imágenes, fuentes → cache first
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2|ttf)$/.test(url.pathname);
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        }).catch(() => caches.match(OFFLINE_URL));
      })
    );
    return;
  }

  // Navegación (páginas HTML) → network first, cache fallback, offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() =>
          caches.match(event.request)
            .then(cached => cached || caches.match('/') || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Todo lo demás → network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
