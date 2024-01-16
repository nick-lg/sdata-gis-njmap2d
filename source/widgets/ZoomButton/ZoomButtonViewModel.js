import { WidgetViewModel } from "../WidgetViewModel.js"

class ZoomButtonViewModel extends WidgetViewModel {
    constructor(options) {
        super(options);
    }

    onZoomInClicked(eventArg) {
        eventArg._map.zoomIn();
    }
    onZoomOutClicked(eventArg) {
        eventArg._map.zoomOut();
    }

    destrory() {
        this._map = undefined;
    }
}

export { ZoomButtonViewModel }