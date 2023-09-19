/**
 * Bird Finder Application Main Script.
 *
 * This script is responsible for:
 * - Registering Service Workers.
 * - Handling application installation functionality.
 * - Initializing the main application based on configuration.
 *
 * @see https://developers.google.com/codelabs/pwa-training/pwa03--going-offline
 */

import App from './app.js';

/**
 * Logging Constants: These constants provide a unified format for log messages, 
 * making it easier to identify and manage logs related to the Service Worker.
 */
const SW_URL = './sw.js'; // Service Worker URL.
const SW_LOG_PREFIX = '[Service Worker]';
const APP_LOG_PREFIX = '[App]';

let appInstalled = false;

/**
 * Registers the service worker if supported by the browser.
 */
function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register(SW_URL)
            .then(reg => console.log(`${SW_LOG_PREFIX} Registered:`, reg))
            .catch(err => console.log(`${SW_LOG_PREFIX} Registration failed:`, err));
    });
}

function handleBeforeInstallPrompt(event) {
    event.preventDefault();
    console.log(`${APP_LOG_PREFIX} before install:`, event);
    window.deferredPrompt = event;
}

function handleAppInstalled(event) {
    console.log(`${APP_LOG_PREFIX} installed:`, event);
    window.deferredPrompt = null;
}

/**
 * Listens for application installation events and logs relevant information.
 */
function handleAppInstallEvents() {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    checkIfAppIsStandalone();
}

function checkIfAppIsStandalone() {
    if (!('matchMedia' in window)) {
        console.log(`${APP_LOG_PREFIX} Your browser does not support the matchMedia API.`);
        return;
    }

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        console.log(`${APP_LOG_PREFIX} Display-mode is standalone.`);
        appInstalled = true;
    }
}

/**
 * Fetches the application configuration from the provided path.
 *
 * @returns {Object} - Parsed configuration object.
 */
async function fetchConfig() {
    try {
        const response = await fetch('./config/config.json');
        if (!response.ok) throw new Error('Failed to fetch configuration.');
        return response.json();
    }
    catch (error) {
        throw new Error('Error fetching configuration:', error);
    }
}

/**
 * Initializes the application with the provided configuration.
 *
 * @param {Object} config - Application configuration.
 */
function startApp(config) {
    const app = new App(config);
    app.createApp();
}

/**
 * Main initialization function to set up the application.
 */
async function init() {
    try {
        const config = await fetchConfig();
        config.app.installed = appInstalled;
        startApp(config);
    }
    catch (error) {
        console.error('Error during initialization:', error);
    }
}

// Main Execution
registerServiceWorker();
handleAppInstallEvents();
init();