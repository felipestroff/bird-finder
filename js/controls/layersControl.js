/**
 * LayersControl class: Provides functionality to manage layer controls on a map.
 */
export default class LayersControl {
    /**
     * Initializes the LayersControl instance.
     * 
     * @param {Object} app - The main application object containing the configuration, map, and layers.
     */
    constructor(app) {
        this.app = app;
        this.map = app.map;
        this.baseLayers = app.layers.base;
    }

    /**
     * Creates and adds a layers control to the map. This control allows users to switch between different base layers.
     */
    createControl() {
        new L.Control.Layers(this.baseLayers, null, {
            position: 'bottomright'
        })
        .addTo(this.map);
    }
}