/**
 * Service Worker for the bird-finder application.
 * 
 * This Service Worker handles caching of assets to make
 * the application work offline and improve load performance.
 * 
 * Last Modified: 08/24/2023
 * 
 * @see https://willianjusten.com.br/como-fazer-seu-site-funcionar-offline-com-pwa
 */

// Cache Versioning
const CACHE_VERSION = 'v1';
const CACHE_NAME = `bird-finder-${CACHE_VERSION}`;

// Core Resources: Essential for the functioning of the app.
const coreResources = [
  './',
  './index.html',
  './manifest.json',
];

// JavaScript Resources: Application logic.
const jsResources = [
  './js/main.js',
  './js/app.js',
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
  event.waitUntil(cacheFiles());
});

/**
 * Event Listener: Activation
 * Cleanup old caches on Service Worker activation.
 */
self.addEventListener('activate', (event) => {
  console.log(LOG_ACTIVATE);
  event.waitUntil(cleanupOldCaches());
});

/**
 * Event Listener: Fetch
 * Intercept network requests and serve them from cache if available.
 */
self.addEventListener('fetch', (event) => {
  console.log(`${LOG_FETCH} ${event.request.url}`);
  event.respondWith(fetchFromCacheOrNetwork(event.request));
});

/**
 * Cache Files: Function to cache the defined resources.
 * @returns {Promise}
 */
async function cacheFiles() {
  try {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(precacheResources.map(resource => 
      cache.add(resource).catch(error => 
        console.error(`${LOG_FAILED_CACHE_RESOURCE} ${resource}`, error)
      )
    ));
  }
  catch (error) {
    console.error(LOG_FAILED_CACHE_OPEN, error);
  }
}

/**
 * Cleanup Old Caches: Function to remove outdated caches.
 * @returns {Promise}
 */
async function cleanupOldCaches() {
  try {
    const cacheNames = await caches.keys();
    const oldCacheNames = cacheNames
      .filter(cacheName => cacheName.startsWith('cache-') && cacheName !== CACHE_NAME);
    await Promise.all(oldCacheNames.map(cacheName => caches.delete(cacheName)));
  }
  catch (error) {
    console.error(LOG_FAILED_DELETE_OLD_CACHES, error);
  }
}

/**
 * Fetch from Cache or Network: 
 * Function to first try fetching a resource from cache, and if unavailable, fetch from the network.
 * @param {Request} request - The request object.
 * @returns {Promise}
 */
async function fetchFromCacheOrNetwork(request) {
  try {
    const cachedResponse = await caches.match(request);
    return cachedResponse || await fetch(request);
  }
  catch (error) {
    console.error(LOG_FAILED_FETCH_CACHE, error);
  }
}