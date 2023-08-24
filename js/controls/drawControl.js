export default class DrawControl {
    constructor(app) {
        this.app = app;
        this.config = app.config;
        this.map = app.map;
        this.langControl = app.controls.langControl;
        this.drawLayer = app.layers.draw;
    }

    /**
     * Creates a custom control and adds it to the map.
     */
    createControl() {
        this.setControlLocal();

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

    setControlLocal() {
        L.drawLocal.draw.handlers.circle.radius = this.langControl.translate('Radius');
        L.drawLocal.draw.handlers.circle.tooltip.start = this.langControl.translate('Click and drag to draw circle');
        L.drawLocal.draw.handlers.polygon.tooltip.cont = this.langControl.translate('Click to continue drawing shape');
        L.drawLocal.draw.handlers.polygon.tooltip.end = this.langControl.translate('Click first point to close this shape');
        L.drawLocal.draw.handlers.polygon.tooltip.start = this.langControl.translate('Click to start drawing shape');
        L.drawLocal.draw.handlers.rectangle.tooltip.start = this.langControl.translate('Click and drag to draw rectangle');
        L.drawLocal.draw.handlers.simpleshape.tooltip.end = this.langControl.translate('Release to finish drawing');
        L.drawLocal.draw.toolbar.actions.text = this.langControl.translate('Cancel');
        L.drawLocal.draw.toolbar.actions.title = this.langControl.translate('Cancel drawing');
        L.drawLocal.draw.toolbar.buttons.polygon = this.langControl.translate('Draw a polygon');
        L.drawLocal.draw.toolbar.buttons.rectangle = this.langControl.translate('Draw a rectangle');
        L.drawLocal.draw.toolbar.buttons.circle = this.langControl.translate('Draw a circle');
        L.drawLocal.draw.toolbar.finish.text = this.langControl.translate('Finish');
        L.drawLocal.draw.toolbar.finish.title = this.langControl.translate('Finish drawing');
        L.drawLocal.draw.toolbar.undo.text = this.langControl.translate('Delete last point');
        L.drawLocal.draw.toolbar.undo.title = this.langControl.translate('Delete last point drawn');
        L.drawLocal.edit.handlers.remove.tooltip.text = this.langControl.translate('Click on a feature to remove');
        L.drawLocal.edit.toolbar.actions.cancel.text = this.langControl.translate('Cancel');
        L.drawLocal.edit.toolbar.actions.cancel.title = this.langControl.translate('Cancel editing, discards all changes');
        L.drawLocal.edit.toolbar.actions.clearAll.text = this.langControl.translate('Clear All');
        L.drawLocal.edit.toolbar.actions.clearAll.title = this.langControl.translate('Clear all layers');
        L.drawLocal.edit.toolbar.buttons.removeDisabled = this.langControl.translate('No layers to delete');
        L.drawLocal.edit.toolbar.buttons.remove = this.langControl.translate('Delete layers');
    }
}