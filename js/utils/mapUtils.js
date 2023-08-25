/**
 * MapUtils: A utility class for handling map controls.
 *
 * This utility is designed to manage certain interactive features of a map.
 * Specifically, it disables dragging, double-click zooming, and scroll wheel zooming
 * when a control element is interacted with (e.g., hovered over). 
 * This behavior is disabled on mobile devices for better user experience.
 */
export default class MapUtils {
    /**
     * Initializes a new instance of MapUtils.
     *
     * @param {Object} map - The map instance to control.
     * @param {Object} config - The App configuration.
     */
    constructor(map, mapConfig) {
        this.isMobile = L.Browser.mobile;
        this.map = map;
        this.mapConfig = mapConfig;
    }

    /**
     * Disables certain map interactions when hovering over a control element.
     * This function is a no-op for mobile devices.
     *
     * @param {Event} event - The event triggering the method.
     */
    onControlOver(event) {
        if (this.isMobile) return;
        this._setMapInteractions(false);
    }
    
    /**
     * Re-enables certain map interactions when the cursor leaves a control element.
     * This function is a no-op for mobile devices.
     *
     * @param {Event} event - The event triggering the method.
     */
    onControlOut(event) {
        if (this.isMobile) return;
        this._setMapInteractions(true);
    }

    setDefaultExtent() {
        this.map.setView(this.mapConfig.latLng, this.mapConfig.zoom);
    }

    /**
     * Adjusts the map's boundaries to fit these bounds.
     * @param {Object} bounds
     */
    fitMapBounds(bounds) {
        this.map.fitBounds(bounds);
    }

    /**
     * Finds the marker with the given ID from the marker layer.
     * 
     * @param {string} id - The ID of the marker to find.
     * @returns {Object} The found marker or null if not found.
     * @private
     */
    findMarkerById(id, markerLayer) {
        return markerLayer.getLayers().find(layer => layer.options.id == id);
    }

    /**
     * Adjusts the map's view to center on the given LatLng slightly adjusted.
     * @param {Object} latLng - The LatLng object.
     */
    adjustMapViewBasedOnPopup(latLng) {
        const newLat = latLng.lat + 0.0010;
        const newLatLng = [newLat, latLng.lng];
        this.map.setView(newLatLng);
    }

    /**
     * Sets the bounding box property based on the provided drawn layer and its type.
     * @param {Object} layer - The drawn layer object.
     * @param {string} layerType - The type of the drawn layer (e.g., circle, polygon).
     * @returns {Object} The found marker or null if not found.
     */
    getBoundingBoxFromDrawnLayer(layer, layerType) {
        let bbox;
        if (layerType !== 'circle') {
            bbox = layer.getBounds(); 
        }
        else {
            const latLng = layer.getLatLng();
            const radius = layer.getRadius();
            bbox = latLng.toBounds(radius);
        }
        return bbox;
    }

    /**
     * Enables or disables map interactions based on the provided flag.
     *
     * @param {boolean} isEnabled - Flag indicating whether to enable or disable interactions.
     * @private
     */
    _setMapInteractions(isEnabled) {
        const method = isEnabled ? 'enable' : 'disable';

        this.map.dragging[method]();
        this.map.doubleClickZoom[method]();
        this.map.scrollWheelZoom[method]();
    }
}