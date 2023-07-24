// Global variables
let config; // Variable to store the application configuration
let lang; // Variable to store the current language code
let langConfig; // Variable to store the language configuration
const isMobile = L.Browser.mobile; // A constant flag to check if the device is mobile or not

// Function to initialize the application
async function init() {
    try {
        // Fetch the configuration from 'config.json' and store it in the 'config' variable
        config = await fetchConfig();

        // Get the language from the URL parameters or use the default language from the configuration
        lang = getUrlLang() || config.app.defaultLang;

        // Fetch the language configuration from the 'nls' directory based on the language code
        if (lang !== 'en-US') {
            langConfig = await fetchLangConfig(lang);
        }

        // Set the document's language attribute to the selected language
        document.documentElement.lang = lang;

        // Call the function to create the map and other controls
        createMap();
    }
    catch (error) {
        // If there is an error during initialization, log it to the console
        console.error('Error during initialization:', error);
    }
}

// Function to get the language from the URL parameters
function getUrlLang() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang');
}

// Function to fetch the configuration from 'config.json'
async function fetchConfig() {
    const response = await fetch('./config.json');
    return response.json();
}

// Function to fetch the language configuration from the 'nls' directory
async function fetchLangConfig(lang) {
    const response = await fetch(`./src/nls/${lang}.json`);
    return response.json();
}

// Function to translate a string using the language configuration
function translate(string) {
    // Return the translated string if available in the language configuration, otherwise return the original string
    return langConfig && langConfig[string] || string;
}

// Function to change the application language
function changeAppLang() {
    // Toggle between 'pt-BR' and 'en-US' languages
    const newLang = lang === 'pt-BR' ? 'en-US' : 'pt-BR';

    // Update the 'lang' URL parameter with the new language
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('lang');
    urlParams.append('lang', newLang);

    // Create the new URL with the updated language parameter
    const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;

    // Replace the current URL with the new one to change the language
    window.location.replace(newUrl);
}

// Call the 'init' function to initialize the application when the script is loaded
init();
