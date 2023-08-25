/**
 * Service Worker for the bird-finder application.
 * 
 * This Service Worker handles caching of assets to make
 * the application work offline and improve load performance.
 * 
 * Last Modified: 08/25/2023
 * 
 * @see https://willianjusten.com.br/como-fazer-seu-site-funcionar-offline-com-pwa
 */

// Cache Versioning
const CACHE_NAME = 'bird-finder';
const CACHE_VERSION = 'v2';
const staticCacheName = `${CACHE_NAME}-${CACHE_VERSION}`;

// Core Resources: Essential for the functioning of the app.
const coreResources = [
  './',
  './index.html',
  './manifest.json',
];

// JavaScript Resources: Application logic.
const jsResources = [
  './js/utils/controlUtils.js',
  './js/controls/langControl.js',
  './js/controls/helpControl.js',
  './js/controls/locationControl.js',
  './js/controls/drawControl.js',
  './js/controls/layersControl.js',
  './js/controls/searchControl.js',
  './js/app.js',
  './js/main.js'
];

// CSS Resources: Styling information.
const cssResources = [
  './css/style.css',
  './libs/leaflet-draw/leaflet.draw.css',
  './libs/leaflet-markercluster/MarkerCluster.css',
  './libs/leaflet-markercluster/MarkerCluster.Default.css',
  './libs/bootstrap/bootstrap.css',
  './libs/leaflet/leaflet.css',
];

// Image Resources: Visual assets used across the app.
const imageResources = [
  './assets/favicon.ico',
  './assets/favicon-16x16.png',
  './assets/favicon-32x32.png',
  './assets/icon-32x32.png',
  './assets/icon-64x64.png',
  './assets/icon-128x128.png',
  './assets/icon-256x256.png',
  './assets/icon-512x512.png',
  './assets/apple-touch-icon.png',
  './assets/binoculars.png',
  './assets/en-US.png',
  './assets/pt-BR.png',
  './assets/sound.png',
  './libs/leaflet/images/layers.png',
  './libs/leaflet/images/layers-2x.png',
  './libs/leaflet/images/marker-icon.png',
  './libs/leaflet/images/marker-icon-2x.png',
  './libs/leaflet/images/marker-shadow.png',
  './libs/leaflet-draw/images/spritesheet.svg',
];

// Library Resources: Third-party libraries and data.
const libraryResources = [
  './libs/bootstrap/bootstrap.bundle.js',
  './libs/leaflet/leaflet.js',
  './libs/leaflet-draw/leaflet.draw.js',
  './libs/leaflet-markercluster/leaflet.markercluster.js',
  './config/config.json',
  './locales/pt-BR.json',
];

// Consolidated List of All Resources to Cache
const precacheResources = [
  ...coreResources,
  ...jsResources,
  ...cssResources,
  ...imageResources,
  ...libraryResources
];

/**
 * Logging Constants: These constants provide a unified format for log messages, 
 * making it easier to identify and manage logs related to the Service Worker.
 */
const LOG_PREFIX = '[Service Worker]';
const LOG_INSTALL = `${LOG_PREFIX} Install event!`;
const LOG_ACTIVATE = `${LOG_PREFIX} Activate event!`;
const LOG_FETCH = `${LOG_PREFIX} Fetch intercepted for:`;
const LOG_FAILED_CACHE_OPEN = `${LOG_PREFIX} Failed to open cache.`;
const LOG_FAILED_CACHE_RESOURCE = `${LOG_PREFIX} Failed to cache resource.`;
const LOG_FAILED_DELETE_OLD_CACHES = `${LOG_PREFIX} Failed to delete old caches.`;
const LOG_FAILED_FETCH_CACHE = `${LOG_PREFIX} Error fetching from cache.`;

/**
 * Event Listener: Installation
 * Cache necessary resources during Service Worker installation.
 */
self.addEventListener('install', (event) => {
  console.log(LOG_INSTALL);
  self.skipWaiting();
  
  const filesUpdate = (cache) => {
    const promises = precacheResources.map((resource) => {
      return cache.add(resource).catch((error) => {
        console.error(`${LOG_FAILED_CACHE_OPEN}: ${resource}`, error);
      });
    });

    return Promise.all(promises);
  };

  event.waitUntil(
    caches.open(staticCacheName)
      .then(filesUpdate)
      .catch((error) => {
        console.error(LOG_FAILED_CACHE_OPEN, error);
      })
  );
});

/**
 * Event Listener: Activation
 * Cleanup old caches on Service Worker activation.
 */
self.addEventListener('activate', (event) => {
  console.log(LOG_ACTIVATE);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith(CACHE_NAME))
            .filter((cacheName) => cacheName !== staticCacheName)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .catch((error) => {
        console.error(LOG_FAILED_DELETE_OLD_CACHES, error);
      })
  );
});

/**
 * Event Listener: Fetch
 * Intercept network requests and serve them from cache if available.
 */
self.addEventListener('fetch', (event) => {
  console.log(`${LOG_FETCH} ${event.request.url}`);
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch((error) => {
        console.error(LOG_FAILED_FETCH_CACHE, error);
      })
  );
});