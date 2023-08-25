/**
 * Bird Finder Application Main Script
 *
 * This script initializes the application, sets up Service Workers, 
 * and handles the application's language and installation functionality.
 * 
 * @see https://developers.google.com/codelabs/pwa-training/pwa03--going-offline
 */

import App from './app.js';

/**
 * Logging Constants: These constants provide a unified format for log messages, 
 * making it easier to identify and manage logs related to the Service Worker.
 */
const SW_LOG_PREFIX = '[Service Worker]';
const SW_LOG_REGISTERED = `${SW_LOG_PREFIX} Registered:`;
const SW_LOG_REGISTRATION_FAILED = `${SW_LOG_PREFIX} Registration failed:`;

// Service Worker URL.
const swURL = './sw.js';

// Unregister old service worker
navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
        registration.unregister();
    });
});

if ('serviceWorker' in navigator) {
    // Wait for the 'load' event to not block other work
    window.addEventListener('load', async () => {
        // Try to register the service worker.
        try {
            navigator.serviceWorker.register(swURL).then(reg => {
                console.log(SW_LOG_REGISTERED, reg);
            });
        }
        catch (err) {
            console.log(SW_LOG_REGISTRATION_FAILED, err);
        }
    });
}

const APP_LOG_PREFIX = '[App]';
const APP_LOG_BEFORE_INSTALL = `${APP_LOG_PREFIX} before install:`;
const APP_LOG_INSTALLED = `${APP_LOG_PREFIX} installed:`;
const APP_LOG_DISPLAY_MODE_STANDALONE = `${APP_LOG_PREFIX} Display-mode is standalone.`;
const APP_LOG_BROWSER_NOT_SUPPORT = `${APP_LOG_PREFIX} Your browser does not support the matchMedia API.`;

window.addEventListener('beforeinstallprompt', (event) => {
    // Prevent the mini-infobar from appearing on mobile.
    event.preventDefault();
    console.log(APP_LOG_BEFORE_INSTALL, event);
    // Stash the event so it can be triggered later.
    window.deferredPrompt = event;
});

window.addEventListener('appinstalled', (event) => {
    console.log(APP_LOG_INSTALLED, event);
    // Clear the deferredPrompt so it can be garbage collected
    window.deferredPrompt = null;
});

if ('matchMedia' in window) {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        console.log(APP_LOG_DISPLAY_MODE_STANDALONE);
        config.app.installed = true;
    }
}
else {
    console.log(APP_LOG_BROWSER_NOT_SUPPORT);
}

async function init() {
    try {
        const config = await fetchConfig();

        startApp(config);
    }
    catch (error) {
        console.error('Error during initialization:', error);
    }
}

// Fetch the application configuration.
async function fetchConfig() {
    const response = await fetch('./config/config.json');
    return response.json();
}

// Methods
function startApp(config) {
    const app = new App(config);
    app.createApp(); 
}

// Trigger the initialization function upon script load.
init();