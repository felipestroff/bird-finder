/**
 * HelpControl class: Provides utility methods for creating and managing a custom help control on a map.
 */
export default class HelpControl {
    /**
     * Constructor: Initializes the HelpControl instance.
     * 
     * @param {Object} app - The main application object.
     */
    constructor(app) {
        this.app = app;
        this.config = app.config.app;
        this.map = app.map;
        this.langControl = app.controls.langControl;
        this.mapUtils = app.mapUtils;
    }

    /**
     * Creates a custom control and adds it to the map.
     */
    createControl() {
        const Control = this._createControlClass();
        new Control({ position: 'bottomleft' }).addTo(this.map);
    }

    /**
     * Binds the necessary events to the location control container.
     * @private
     */
    _bindControlEvents() {
        L.DomEvent.on(this.container, 'mouseover touchstart', this.mapUtils.onControlOver.bind(this.mapUtils));
        L.DomEvent.on(this.container, 'mouseout touchend', this.mapUtils.onControlOut.bind(this.mapUtils));

        const installButton = this.container.querySelector('#installAppBtn');
        if (installButton) {
            installButton.addEventListener('click', this._installApp);
        }
    }

    /**
     * Install the application.
     * @private
     */
    async _installApp() {
        console.log('[App] Install button clicked.');
        const promptEvent = window.deferredPrompt;
        if (!promptEvent) return;
        
        promptEvent.prompt();
        const result = await promptEvent.userChoice;
        console.log('[App] userChoice:', result);
        window.deferredPrompt = null;
    }

    /**
     * Creates a custom Leaflet control class for the help functionalities.
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

    /**
     * Creates a container for the help control with the necessary HTML elements.
     * 
     * @returns {HTMLElement} The help control container element.
     * @private
     */
    _createControlContainer() {
        const container = L.DomUtil.create('div', 'control leaflet-control');
        container.innerHTML = this._getControlHTML();
        return container;
    }

    /**
     * Returns the HTML string for the help control's content.
     * 
     * @returns {string} The help control's HTML content.
     * @private
     */
    _getControlHTML() {
        return `
            <button class="btn btn-light btn-sm border-dark-subtle" type="button" title="${this.langControl.translate('Help')}" data-bs-toggle="collapse" data-bs-target="#helpControlContent" aria-expanded="false" aria-controls="helpControlContent">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-info-circle-fill" viewBox="0 0 16 16">
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                </svg>
            </button>
            <div class="control-content collapse show" id="helpControlContent">
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                        ${this.langControl.translate('To search for a location and get more accurate results, type for example: City, State')}
                    </li>
                    <li class="list-group-item">
                        ${this.langControl.translate('It is also possible to search the species by common names of the region or scientific name')}
                    </li>
                    <li class="list-group-item">
                        ${this.langControl.translate('When you finish your search, you can click on the desired species in the list or on the map markers to see more details about it')}
                    </li>
                </ul>

                <div class="${!this.config.installed ? 'd-grid gap-2' : 'd-none'}">
                    <button id="installAppBtn" class="btn btn-success btn-sm" type="button">
                        ${this.langControl.translate('Install App')}
                    </button>
                </div>
            </div>
        `;
    }
}