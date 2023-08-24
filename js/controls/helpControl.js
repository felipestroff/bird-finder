export default class HelpControl {
    constructor(app) {
        this.app = app;
        this.config = app.config;
        this.map = app.map;
        this.langControl = app.controls.langControl;
        this.controlUtils = app.controlUtils;
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

                <div class="${!this.config.app.installed ? 'd-grid gap-2' : 'd-none'}">
                    <button id="installAppBtn" class="btn btn-success btn-sm" type="button">
                        ${this.langControl.translate('Install App')}
                    </button>
                </div>
            </div>
        `;
    }

    // Binds the necessary events (mouseover, mouseout, touchstart, touchend) to the location control container.
    bindControlEvents() {
        L.DomEvent.on(this.container, 'mouseover touchstart', this.controlUtils.onControlOver.bind(this));
        L.DomEvent.on(this.container, 'mouseout touchend', this.controlUtils.onControlOut.bind(this));

        this.container.querySelector('#installAppBtn').addEventListener('click', this.installApp);
    }

    // Install the application.
    async installApp() {
        console.log('[App] Install button clicked.');
        const promptEvent = window.deferredPrompt;
        if (!promptEvent) return;
        promptEvent.prompt();
        const result = await promptEvent.userChoice;
        console.log('[App] userChoice:', result);
        window.deferredPrompt = null;
    }
}