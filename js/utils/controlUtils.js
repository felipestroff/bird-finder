export default class ControlUtils {
    constructor() {
        this.map = map;
        this.isMobile = L.Browser.mobile;
    }

    onControlOver(event) {
        if (this.isMobile) return;
        this.map.dragging.disable();
        this.map.doubleClickZoom.disable();
        this.map.scrollWheelZoom.disable();
    }
    
    onControlOut(event) {
        if (this.isMobile) return;
        this.map.dragging.enable();
        this.map.doubleClickZoom.enable();
        this.map.scrollWheelZoom.enable();
    }
}