import { JSHelper } from "../../../libs/JSHelper.js";
import { MouseEventType } from "../../index.js";
import { WidgetViewModel } from "../WidgetViewModel.js"

class LocationBarViewModel extends WidgetViewModel {

    containsHeight;//是否包含高程通道
    decimals;
    lng;
    lat;
    alt;

    _cache = {
        ray: new Cesium.Ray(),
        cartesian3: new Cesium.Cartesian2(),
        cartographic: new Cesium.Cartographic(),
        foundPosition: false,
    }

    constructor(options) {
        super(options);

        this.containsHeight = options.containsHeight || false;

        this.decimals = JSHelper.Clamp(options.decimals || 6, 1, 8);

        this.#subscibeEvent();
    }

    #subscibeEvent() {
        this.map.mouseEvent.on(MouseEventType.MOUSE_MOVE, this.#onMouseMove, this);
    }


    #onMouseMove(eventArg) {
        if (eventArg.wgs84SurfacePosition) {
            this.lng = `${eventArg.wgs84SurfacePosition.lng.toFixed(this.decimals)}°`;
            this.lat = `${eventArg.wgs84SurfacePosition.lat.toFixed(this.decimals)}°`;
            if (this.containsHeight)
                this.alt = `${eventArg.wgs84SurfacePosition.alt.toFixed(this.decimals)}m`;
        }
        else {
            this.lng = Number.NaN;
            this.lat = Number.NaN;
            if (this.containsHeight)
                this.alt = Number.NaN;
        }
    }

    destrory() {
        this._map.mouseEvent.off(MouseEventType.MOUSE_MOVE, this.#onMouseMove);
        this._map = undefined;
    }
}

export { LocationBarViewModel }