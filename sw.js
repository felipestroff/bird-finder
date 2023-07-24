// https://willianjusten.com.br/como-fazer-seu-site-funcionar-offline-com-pwa

// Choose a cache name
const staticCacheName = 'cache-v0.1';

const precacheResources = [
  './',
  './index.html',
  './manifest.json',
  './config.json',
  './src/nls/pt-BR.json',
  './src/js/config.js',
  './src/js/app.js',
  './src/assets/css/style.css',
  './src/assets/icons/favicon.ico',
  './src/assets/icons/favicon-16x16.png',
  './src/assets/icons/favicon-32x32.png',
  './src/assets/icons/icon-192x192.png',
  './src/assets/icons/apple-touch-icon.png',
  './src/assets/images/binoculars.png',
  './src/assets/images/en-US.png',
  './src/assets/images/pt-BR.png',
  './src/assets/images/sound.png',
  './src/lib/bootstrap/bootstrap.css',
  './src/lib/bootstrap/bootstrap.bundle.js',
  './src/lib/leaflet/leaflet.css',
  './src/lib/leaflet/leaflet.js',
  './src/lib/leaflet/images/marker-icon.png',
  './src/lib/leaflet/images/marker-shadow.png',
  './src/lib/leaflet-draw/images/spritesheet.svg',
  './src/lib/leaflet-draw/leaflet.draw.css',
  './src/lib/leaflet-draw/leaflet.draw.js',
  './src/lib/leaflet-markercluster/leaflet.markercluster.js',
  './src/lib/leaflet-markercluster/MarkerCluster.css',
  './src/lib/leaflet-markercluster/MarkerCluster.Default.css'
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
    caches.open(staticCacheName)
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
            .filter((cacheName) => cacheName !== staticCacheName)
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