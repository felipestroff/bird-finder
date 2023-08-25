/**
 * Service Worker for the Bird Finder Application.
 *
 * Responsibilities:
 * - Caching of assets for offline usage.
 * - Improving load performance by serving cached assets.
 * 
 * Last Modified: 08/25/2023
 * 
 * @see https://willianjusten.com.br/como-fazer-seu-site-funcionar-offline-com-pwa
 */

// Cache Versioning
const CACHE_PREFIX = 'bird-finder';
const CACHE_VERSION = 'v2';
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`;

// Core Resources: Essential for the functioning of the app.
const coreResources = [
  './',
  './index.html',
  './manifest.json',
];

// JavaScript Resources: Application logic.
const jsResources = [
  './js/utils/urlUtils.js',
  './js/utils/mapUtils.js',
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
  './assets/icons/icon-48x48.png',
  './assets/icons/icon-72x72.png',
  './assets/icons/icon-96x96.png',
  './assets/icons/icon-128x128.png',
  './assets/icons/icon-144x144.png',
  './assets/icons/icon-152x152.png',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-384x384.png',
  './assets/icons/icon-512x512.png',
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

self.addEventListener('install', handleInstall);
self.addEventListener('activate', handleActivate);
self.addEventListener('fetch', handleFetch);

/**
 * Handles the service worker installation event.
 * Caches essential resources.
 *
 * @param {Event} event - Install event
 */
function handleInstall(event) {
  console.log(LOG_INSTALL);
  self.skipWaiting();
  event.waitUntil(cacheFiles());
}

/**
 * Handles the service worker activation event.
 * Removes old cached resources.
 *
 * @param {Event} event - Activate event
 */
function handleActivate(event) {
  console.log(LOG_ACTIVATE);
  event.waitUntil(cleanupOldCaches());
}

/**
 * Handles the fetch event by serving requests from cache or network.
 *
 * @param {Event} event - Fetch event
 */
function handleFetch(event) {
  console.log(`${LOG_FETCH} ${event.request.url}`);
  event.respondWith(fetchFromCacheOrNetwork(event.request));
}

/**
 * Caches the predefined resources.
 *
 * @returns {Promise} A promise representing the completion of caching.
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
 * Removes outdated caches to free up space.
 *
 * @returns {Promise} A promise representing the cleanup process.
 */
async function cleanupOldCaches() {
  try {
    const cacheNames = await caches.keys();
    const oldCacheNames = cacheNames
      .filter(cacheName => cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME);
    await Promise.all(oldCacheNames.map(cacheName => caches.delete(cacheName)));
  }
  catch (error) {
    console.error(LOG_FAILED_DELETE_OLD_CACHES, error);
  }
}

/**
 * Attempts to fetch a resource from the cache. If not found, fetches from the network.
 *
 * @param {Request} request - The request object.
 * @returns {Promise<Response>} A promise representing the response object.
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