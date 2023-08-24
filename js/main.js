/**
 * Bird Finder Application Main Script
 *
 * This script initializes the application, sets up Service Workers, 
 * and handles the application's language and installation functionality.
 * 
 * @see https://developers.google.com/codelabs/pwa-training/pwa03--going-offline
 */

// ================================
// 1. Global variables
// ================================

// Flag to check if the app is installed.
let appInstalled = false;

// Variable to store the application configuration.
let config;

// Variable to store the current language code.
let lang;

// Variable to store the language configuration.
let langConfig;

// Constant flag to check if the device is mobile or not.
const isMobile = L.Browser.mobile;

// ================================
// 2. Service Worker Registration
// ================================

/**
 * Logging Constants: These constants provide a unified format for log messages, 
 * making it easier to identify and manage logs related to the Service Worker.
 */
const SW_LOG_PREFIX = '[Service Worker]';
const SW_LOG_REGISTERED = `${SW_LOG_PREFIX} Registered:`;
const SW_LOG_REGISTRATION_FAILED = `${SW_LOG_PREFIX} Registration failed:`;

// Service Worker URL.
const swURL = './sw.js';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(swURL)
            .then(reg => console.log(SW_LOG_REGISTERED, reg))
            .catch(err => console.log(SW_LOG_REGISTRATION_FAILED, err));
    });
}

// ================================
// 3. Installation Event Handlers
// ================================

const APP_LOG_PREFIX = '[App]';
const APP_LOG_BEFORE_INSTALL = `${APP_LOG_PREFIX} before install:`;
const APP_LOG_INSTALLED = `${APP_LOG_PREFIX} installed:`;
const APP_LOG_DISPLAY_MODE_STANDALONE = `${APP_LOG_PREFIX} Display-mode is standalone.`;
const APP_LOG_BROWSER_NOT_SUPPORT = `${APP_LOG_PREFIX} Your browser does not support the matchMedia API.`;
const APP_LOG_INSTALL_BUTTON_CLICKED = `${APP_LOG_PREFIX} Install button clicked.`;
const APP_LOG_USER_CHOICE = `${APP_LOG_PREFIX} userChoice:`;

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    console.log(APP_LOG_BEFORE_INSTALL, event);
    window.deferredPrompt = event;
});

window.addEventListener('appinstalled', (event) => {
    console.log(APP_LOG_INSTALLED, event);
    window.deferredPrompt = null;
});

if ('matchMedia' in window) {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        console.log(APP_LOG_DISPLAY_MODE_STANDALONE);
        appInstalled = true;
    }
}
else {
    console.log(APP_LOG_BROWSER_NOT_SUPPORT);
}

// ================================
// 4. Application Initialization
// ================================

// Initialize the application.
async function init() {
    try {
        config = await fetchConfig();
        lang = getUrlLang() || config.app.defaultLang;
        if (lang !== 'en-US') {
            langConfig = await fetchLangConfig(lang);
        }
        document.documentElement.lang = lang;
        createMap();
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

// Get the language from URL parameters.
function getUrlLang() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang');
}

// Fetch the language configuration.
async function fetchLangConfig(lang) {
    const response = await fetch(`./locales/${lang}.json`);
    return response.json();
}

// ================================
// 5. Language Handling
// ================================

// Translate a string using the language configuration.
function translate(string) {
    return langConfig && langConfig[string] || string;
}

// Change the application language.
function changeAppLang() {
    const newLang = lang === 'pt-BR' ? 'en-US' : 'pt-BR';
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('lang');
    urlParams.append('lang', newLang);
    const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
    window.location.replace(newUrl);
}

// ================================
// 6. Installation Handling
// ================================

// Install the application.
async function installApp() {
    console.log(APP_LOG_INSTALL_BUTTON_CLICKED);
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) return;
    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    console.log(APP_LOG_USER_CHOICE, result);
    window.deferredPrompt = null;
}

// Trigger the initialization function upon script load.
init();