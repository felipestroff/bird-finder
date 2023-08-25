/**
 * LocationControl class: Provides functionalities to manage location controls on a map.
 * Allows users to search for species based on their location and a specified buffer range around it.
 */
export default class LocationControl {
     /**
     * Initializes the LocationControl instance.
     * 
     * @param {Object} app - The main application object containing the configuration, map, and other utilities.
     */
     constructor(app) {
        this.app = app;
        this.map = app.map;
        this.langControl = app.controls.langControl;
        this.drawLayer = app.layers.draw;
        this.mapUtils = app.mapUtils;
    }

    /**
     * Creates and adds a location control to the map.
     */
    createControl() {
        const Control = this._createControlClass();
        new Control({ position: 'topleft' }).addTo(this.map);
    }

    /**
     * Creates a custom Leaflet control class for location functionalities.
     * 
     * @returns {L.Control} A Leaflet control class for location.
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
     * Creates a container for the location control with the necessary HTML elements.
     * 
     * @returns {HTMLElement} The location control container element.
     * @private
     */
    _createControlContainer() {
        const container = L.DomUtil.create('div', 'control leaflet-control');
        container.innerHTML = this._getControlHTML();
        return container;
    }

    /**
     * Generates the HTML content for the location control.
     * 
     * @returns {string} The location control's HTML content.
     * @private
     */
    _getControlHTML() {
        return `
            <div class="d-flex justify-content-start">
                <button class="btn btn-light btn-sm border-dark-subtle" type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#locationControlContent" 
                    title="${this.langControl.translate('My Location')}" 
                    aria-label="${this.langControl.translate('My Location')}" 
                    aria-expanded="false" 
                    aria-controls="locationControlContent">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                    </svg>
                </button>
            </div>
            <div id="locationControlContent" class="control-content collapse collapse-horizontal bg-white rounded">
                <form id="locationControlForm" class="p-2">
                    <p>${this.langControl.translate('To search for species from your location, first define an area around it and then click on the button')}.</p>
                    <div class="mb-3">
                        <label for="bufferRangeInput" class="form-label">${this.langControl.translate('Buffer')}</label>
                        <input id="bufferRangeInput" type="range" class="form-range" min="1" value="10">
                        <div id="bufferHelp" class="form-text">10 ${this.langControl.translate('kilometers')}</div>
                    </div>
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-primary btn-sm" type="submit">${this.langControl.translate('Search')}</button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Binds the necessary events to the location control container.
     * @private
     */
    _bindControlEvents() {
        L.DomEvent.on(this.container, 'mouseover touchstart', this.mapUtils.onControlOver.bind(this.mapUtils));
        L.DomEvent.on(this.container, 'mouseout touchend', this.mapUtils.onControlOut.bind(this.mapUtils));

        this.container.querySelector('#bufferRangeInput').addEventListener('change', this._onBufferChange.bind(this));
        this.container.querySelector('#locationControlForm').addEventListener('submit', this._onLocationSubmit.bind(this));
    }

    /**
     * Handles the change event for the buffer range input. Updates the displayed buffer value accordingly.
     * 
     * @param {Event} event - The change event object.
     * @private
     */
    _onBufferChange(event) {
        const value = event.target.value;
        this.container.querySelector('#bufferHelp').innerText = value + ' ' + this.langControl.translate('kilometers');
    }

    /**
     * Handles the form submission for location-based species search. Initiates location tracking.
     * 
     * @param {Event} event - The form submission event object.
     * @private
     */
    _onLocationSubmit(event) {
        event.preventDefault();
        
        this.app.clearDrawLayers();
        this.map.locate({
            enableHighAccuracy: true
        });
    }
}