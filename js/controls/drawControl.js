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
        const { drawLocal: local } = L;
        const translate = (key) => this.langControl.translate(key);

        // Handlers configuration
        Object.assign(local.draw.handlers, {
            circle: {
                radius: translate('Radius'),
                tooltip: { start: translate('Click and drag to draw circle') },
            },
            polygon: {
                tooltip: {
                    start: translate('Click to start drawing shape'),
                    cont: translate('Click to continue drawing shape'),
                    end: translate('Click first point to close this shape'),
                },
            },
            rectangle: {
                tooltip: { start: translate('Click and drag to draw rectangle') },
            },
            simpleshape: {
                tooltip: { end: translate('Release to finish drawing') },
            },
        });

        // Toolbar configuration
        Object.assign(local.draw.toolbar, {
            buttons: {
                polygon: translate('Draw a polygon'),
                rectangle: translate('Draw a rectangle'),
                circle: translate('Draw a circle'),
            },
            finish: {
                text: translate('Finish'),
                title: translate('Finish drawing'),
            },
            undo: {
                text: translate('Delete last point'),
                title: translate('Delete last point drawn'),
            },
            actions: {
                text: translate('Cancel'),
                title: translate('Cancel drawing'),
                finish: {
                    text: translate('Finish'),
                    title: translate('Finish drawing'),
                },
                undo: {
                    text: translate('Delete last point'),
                    title: translate('Delete last point drawn'),
                },
            },
        });

        // Edit toolbar and handler configuration
        Object.assign(local.edit.toolbar.actions, {
            cancel: {
                text: translate('Cancel'),
                title: translate('Cancel editing, discards all changes'),
            },
            clearAll: {
                text: translate('Clear All'),
                title: translate('Clear all layers'),
            },
            removeDisabled: translate('No layers to delete'),
            remove: translate('Delete layers'),
        });

        local.edit.handlers.remove.tooltip.text = translate('Click on a feature to remove');
    }
}