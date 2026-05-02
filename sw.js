const CACHE_NAME = 'integra-losrios-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './banner.png',
  './icon-192.png'
  './icon-512.png'
];

// INSTALACIÓN
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ACTIVACIÓN
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // ✅ INDEX.HTML: SIEMPRE PEDIR A LA RED
  if (url.pathname.endsWith('/index.html') || url.pathname === '/IntegraLosRios/') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // ✅ OTROS ARCHIVOS: CACHE FIRST
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
