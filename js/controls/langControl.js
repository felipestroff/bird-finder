export default class LangControl {
    constructor(app) {
        this.app = app;
        this.config = app.config;
        this.map = app.map;
    }

    /**
     * Creates a custom control and adds it to the map.
     */
    createControl() {
        const Control = this.createControlClass();
        new Control({ position: 'bottomleft' }).addTo(this.map);
    }

    /**
     * Creates a custom Leaflet control class for location functionalities.
     * 
     * @returns {L.Control} A Leaflet control class for location.
     */
    createControlClass() {
        return L.Control.extend({
            onAdd: () => {
                this.container = this.createControlContainer();
                this.bindControlEvents();
                return this.container;
            }
        });
    }

    /**
     * Creates a container for the location control with the necessary HTML elements.
     * 
     * @returns {HTMLElement} The location control container element.
     */
    createControlContainer() {
        const container = L.DomUtil.create('div', 'control leaflet-control');
        container.innerHTML = this.getControlHTML();
        return container;
    }

    /**
     * Returns the HTML string for the location control's content.
     * 
     * @returns {string} The location control's HTML content.
     */
    getControlHTML() {
        return `
            <button id="langButton" class="btn btn-light btn-sm border-dark-subtle" type="button" title="${this.lang}">
                <img src="./assets/${this.lang}.png" alt="${this.lang}" style="height: 14px;">
            </button>
        `;
    }

    // Binds the necessary events (mouseover, mouseout, touchstart, touchend) to the location control container.
    bindControlEvents() {
        this.container.addEventListener('click', this.changeAppLang.bind(this));
    }

    async setLang() {
        this.lang = this.getUrlLang() || this.config.app.defaultLang;
        if (this.lang !== 'en-US') {
            this.langConfig = await this.fetchLangConfig();
        }
        document.documentElement.lang = this.lang;
    }

    // Get the language from URL parameters.
    getUrlLang() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('lang');
    }

    // Change the application language.
    changeAppLang() {
        const newLang = this.lang === 'pt-BR' ? 'en-US' : 'pt-BR';
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.delete('lang');
        urlParams.append('lang', newLang);
        const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
        window.location.replace(newUrl);
    }

    // Fetch the language configuration.
    async fetchLangConfig() {
        const response = await fetch(`./locales/${this.lang}.json`);
        return response.json();
    }

    // Translate a string using the language configuration.
    translate(string) {
        return this.langConfig && this.langConfig[string] || string;
    }
}