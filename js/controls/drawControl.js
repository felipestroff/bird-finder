/**
 * DrawControl class: Manages the drawing controls for a map.
 * This class interfaces with the Leaflet draw library to provide
 * drawing capabilities and customization of drawing prompts based
 * on the selected language.
 */
export default class DrawControl {
    /**
     * Constructor: Initializes the DrawControl instance.
     * @param {Object} app - The main application instance containing configurations, map, controls, etc.
     */
    constructor(app) {
        this.app = app;
        this.map = app.map;
        this.langControl = app.controls.langControl;
        this.drawLayer = app.layers.draw;
    }

    /**
     * Creates and adds a custom drawing control to the map.
     */
    createControl() {
        this._setControlLocale();

        new L.Control.Draw({
            position: 'topleft',
            edit: {
                featureGroup: this.drawLayer,
                edit: false
            },
            draw: {
                circlemarker: false,
                marker: false,
                polyline: false
            }
        })
        .addTo(this.map);
    }

    /**
     * Updates the default texts in the drawing library based on the current language.
     * Uses the language control to translate default prompts and messages.
     * @private
     */
    _setControlLocale() {
        const local = L.drawLocal;

        // Circle configurations
        local.draw.handlers.circle.radius = this.langControl.translate('Radius');
        local.draw.handlers.circle.tooltip.start = this.langControl.translate('Click and drag to draw circle');

        // Polygon configurations
        local.draw.handlers.polygon.tooltip = {
            cont: this.langControl.translate('Click to continue drawing shape'),
            end: this.langControl.translate('Click first point to close this shape'),
            start: this.langControl.translate('Click to start drawing shape')
        };

        // Rectangle configurations
        local.draw.handlers.rectangle.tooltip.start = this.langControl.translate('Click and drag to draw rectangle');
        
        // Simple shape configurations
        local.draw.handlers.simpleshape.tooltip.end = this.langControl.translate('Release to finish drawing');

        // Toolbar button configurations
        local.draw.toolbar.buttons = {
            polygon: this.langControl.translate('Draw a polygon'),
            rectangle: this.langControl.translate('Draw a rectangle'),
            circle: this.langControl.translate('Draw a circle')
        };

        // Toolbar action configurations
        Object.assign(local.draw.toolbar.actions, {
            text: this.langControl.translate('Cancel'),
            title: this.langControl.translate('Cancel drawing'),
            finish: {
                text: this.langControl.translate('Finish'),
                title: this.langControl.translate('Finish drawing')
            },
            undo: {
                text: this.langControl.translate('Delete last point'),
                title: this.langControl.translate('Delete last point drawn')
            }
        });

        // Edit toolbar configurations
        Object.assign(local.edit.toolbar.actions, {
            cancel: {
                text: this.langControl.translate('Cancel'),
                title: this.langControl.translate('Cancel editing, discards all changes')
            },
            clearAll: {
                text: this.langControl.translate('Clear All'),
                title: this.langControl.translate('Clear all layers')
            },
            removeDisabled: this.langControl.translate('No layers to delete'),
            remove: this.langControl.translate('Delete layers')
        });

        // Edit handler configurations
        local.edit.handlers.remove.tooltip.text = this.langControl.translate('Click on a feature to remove');
    }
}