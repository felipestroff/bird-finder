/**
 * LangControl class: Provides methods for managing the language control and functionalities on a map.
 */
export default class LangControl {
    /**
     * Initializes the LangControl instance.
     * 
     * @param {Object} app - The main application object containing the configuration and map.
     */
    constructor(app) {
        this.app = app;
        this.config = app.config.app;
        this.map = app.map;
        this.langConfig = null;
    }

    /**
     * Creates and adds a custom language control to the map.
     */
    createControl() {
        const Control = this._createControlClass();
        new Control({ position: 'bottomleft' }).addTo(this.map);
    }

    /**
     * Sets the application's language based on URL parameters or default configuration.
     */
    async setLang() {
        this.lang = this._getUrlLang() || this.config.defaultLang;
        if (this.lang !== 'en-US') {
            this.langConfig = await this._fetchLangConfig();
        }
        document.documentElement.lang = this.lang;
    }

    /**
     * Returns the translated string using the loaded language configuration.
     * 
     * @param {string} string - The string to be translated.
     * @returns {string} The translated string.
     */
    translate(string) {
        return this.langConfig && this.langConfig[string] || string;
    }

    /**
     * Binds the necessary event to the language control container.
     * 
     * @private
     */
    _bindControlEvents() {
        this.container.addEventListener('click', this._changeAppLang.bind(this));
    }

    /**
     * Fetches the language configuration based on the current language setting.
     * 
     * @returns {Object} The language configuration.
     * @private
     */
    async _fetchLangConfig() {
        const response = await fetch(`./locales/${this.lang}.json`);
        return response.json();
    }

    /**
     * Toggles the application language.
     * 
     * @private
     */
    _changeAppLang() {
        const newLang = this.lang === 'pt-BR' ? 'en-US' : 'pt-BR';
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.delete('lang');
        urlParams.append('lang', newLang);
        const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
        window.location.replace(newUrl);
    }

    /**
     * Retrieves the language set in the URL parameters.
     * 
     * @returns {string} The language code.
     * @private
     */
    _getUrlLang() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('lang');
    }

    /**
     * Returns the HTML string for the language control's content.
     * 
     * @returns {string} The language control's HTML content.
     * @private
     */
    _getControlHTML() {
        return `
            <button id="langButton" class="btn btn-light btn-sm border-dark-subtle" type="button" title="${this.lang}">
                <img src="./assets/${this.lang}.png" alt="${this.lang}" style="height: 14px;">
            </button>
        `;
    }

    /**
     * Creates a container element for the language control.
     * 
     * @returns {HTMLElement} The language control container element.
     * @private
     */
    _createControlContainer() {
        const container = L.DomUtil.create('div', 'control leaflet-control');
        container.innerHTML = this._getControlHTML();
        return container;
    }

    /**
     * Creates a custom Leaflet control class for language functionalities.
     * 
     * @returns {L.Control} A Leaflet control class.
     * @private
     */
    _createControlClass() {
        return L.Control.extend({
            onAdd: () => {
                this.container = this._createControlContainer();
                this._bindControlEvents();
                return this.container;
            }
        });
    }
}