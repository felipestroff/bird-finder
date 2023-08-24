// https://willianjusten.com.br/como-fazer-seu-site-funcionar-offline-com-pwa

// Choose a cache name
const CACHE_VERSION = 'v1';
const CACHE_NAME = `bird-finder-${CACHE_VERSION}`;

const precacheResources = [
  './',
  './index.html',
  './manifest.json',
  './config/config.json',
  './locales/pt-BR.json',
  './js/main.js',
  './js/app.js',
  './css/style.css',
  './assets/favicon.ico',
  './assets/favicon-16x16.png',
  './assets/favicon-32x32.png',
  './assets/icon-48x48.png',
  './assets/icon-64x64.png',
  './assets/icon-128x128.png',
  './assets/icon-256x256.png',
  './assets/icon-512x512.png',
  './assets/apple-touch-icon.png',
  './assets/binoculars.png',
  './assets/en-US.png',
  './assets/pt-BR.png',
  './assets/sound.png',
  './libs/bootstrap/bootstrap.css',
  './libs/bootstrap/bootstrap.bundle.js',
  './libs/leaflet/leaflet.css',
  './libs/leaflet/leaflet.js',
  './libs/leaflet/images/marker-icon.png',
  './libs/leaflet/images/marker-shadow.png',
  './libs/leaflet-draw/images/spritesheet.svg',
  './libs/leaflet-draw/leaflet.draw.css',
  './libs/leaflet-draw/leaflet.draw.js',
  './libs/leaflet-markercluster/leaflet.markercluster.js',
  './libs/leaflet-markercluster/MarkerCluster.css',
  './libs/leaflet-markercluster/MarkerCluster.Default.css'
]

self.addEventListener('install', (event) => {
  console.log('[sw] Install event!');

  self.skipWaiting();

  const filesUpdate = (cache) => {
    const promises = precacheResources.map((resource) => {
      return cache.add(resource).catch((error) => {
        console.error(`[sw] Failed to cache resource: ${resource}`, error);
      });
    });

    return Promise.all(promises);
  };

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(filesUpdate)
      .catch((error) => {
        console.error('[sw] Failed to open cache:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[sw] Activate event!');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('cache-'))
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .catch((error) => {
        console.error('[sw] Failed to delete old caches:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  console.log('[sw] Fetch intercepted for:', event.request.url);

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch((error) => {
        console.error('[sw] Error fetching from cache:', error);
      })
  );
});