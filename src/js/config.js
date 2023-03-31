// Global variables
var config;
var lang;
var langConfig;
var isMobile = L.Browser.mobile;

async function init() {
    config = await fetchConfig();

    const urlParams = new URLSearchParams(window.location.search);

    lang = urlParams.get('lang') || config.app.defaultLang;
    langConfig = await fetchLangConfig(lang);

    document.documentElement.lang = lang;

    createMap();
}

async function fetchConfig() {
    const response = await fetch('./config.json');
    return response.json();
}

async function fetchLangConfig(lang) {
    const response = await fetch(`./src/nls/${lang}.json`);
    return response.json();
}

function translate(string) {
    return langConfig[string] || string;
}

function changeAppLang(event) {
    const newLang = lang === 'pt-BR' ? 'en-US' : 'pt-BR';

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('lang');
    urlParams.append('lang', newLang);
  
    const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
    
    window.location.replace(newUrl);
}

init()