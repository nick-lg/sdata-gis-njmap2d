// import Cesium from "../../../libs/Cesium/Cesium.js";
import { JSHelper } from "../../../libs/JSHelper.js";
import { MapEventType } from "../../index.js";
import { WidgetViewModel } from "../WidgetViewModel.js"


const distances = [
    1, 2, 3, 5,
    10, 20, 30, 50,
    100, 200, 300, 500,
    1000, 2000, 3000, 5000,
    10000, 20000, 30000, 50000,
    100000, 200000, 300000, 500000,
    1000000, 2000000, 3000000, 5000000,
    10000000, 20000000, 30000000, 50000000]

class ScaleBarViewModel extends WidgetViewModel {


    barWidth;//比例尺宽度
    distanceLabel;//距离
    enabled = true;//启用标识


    _lastUpdateTimeStamp;//上次更新时间
    _now;
    _updateInterval = 250;//更新间隔
    _geodesic = new Cesium.EllipsoidGeodesic()
    constructor(options) {
        super(options);

        this.#subscibeEvent();
    }

    #subscibeEvent() {
        this._map.mapEvent.on(MapEventType.POST_RENDER, this.#postRender, this);
    }


    #postRender(scene) {
        //启用控制
        if (!this.enabled) {
            this.barWidth = undefined;
            this.distanceLabel = undefined;
            return;
        }

        //更新间隔控制(for performance)
        this._now = Cesium.getTimestamp();
        if (this._now < this._lastUpdateTimeStamp + 250) {
            return;
        }
        this._lastUpdateTimeStamp = this._now;

        // Find the distance between two pixels at the bottom center of the screen.
        let width = scene.canvas.clientWidth
        let height = scene.canvas.clientHeight

        let left = scene.camera.getPickRay(new Cesium.Cartesian2((width / 2) | 0, height - 1))
        let right = scene.camera.getPickRay(new Cesium.Cartesian2(1 + (width / 2) | 0, height - 1))

        let globe = scene.globe
        let leftPosition = globe.pick(left, scene)
        let rightPosition = globe.pick(right, scene)

        if (!JSHelper.Defined(leftPosition) || !JSHelper.Defined(rightPosition)) {
            this.barWidth = undefined
            this.distanceLabel = undefined
            return
        }

        let leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPosition)
        let rightCartographic = globe.ellipsoid.cartesianToCartographic(rightPosition)

        this._geodesic.setEndPoints(leftCartographic, rightCartographic)
        let pixelDistance = this._geodesic.surfaceDistance


        // Find the first distance that makes the scale bar less than 100 pixels.
        let maxBarWidth = 100
        let distance
        for (let i = distances.length - 1; !JSHelper.Defined(distance) && i >= 0; --i) {
            if (distances[i] / pixelDistance < maxBarWidth) {
                distance = distances[i]
            }
        }

        if (JSHelper.Defined(distance)) {
            let label
            if (distance >= 1000) {
                label = (distance / 1000).toString() + ' km'
            } else {
                label = distance.toString() + ' m'
            }

            this.barWidth = (distance / pixelDistance) | 0
            this.distanceLabel = label
        } else {
            this.barWidth = undefined
            this.distanceLabel = undefined
        }
    }

    destrory() {
        this._map.mouseEvent.off(MapEventType.POST_RENDER, this.#postRender);
        this._map = undefined;
    }
}

export { ScaleBarViewModel }