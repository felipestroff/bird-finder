export default class LayersControl {
    constructor(app) {
        this.app = app;
        this.config = app.config;
        this.map = app.map;
        this.layers = app.layers.base;
    }

    /**
     * Creates a custom control and adds it to the map.
     */
    createControl() {
        new L.Control.Layers(this.layers, null, {
            position: 'bottomright'
        })
        .addTo(this.map);
    }
}