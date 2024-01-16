import { WidgetViewModel } from "../WidgetViewModel.js"
import { MapEventType } from "../../index.js";
import { JSHelper } from "../../../libs/JSHelper.js";

import * as L from "leaflet";
import "leaflet/dist/leaflet.css"

// 鹰眼ViewModel。(限于2.5D地图范围计算的跳变性，暂不支持2.5D鹰眼)
class EagleEyeViewModel extends WidgetViewModel {
    //二维地图容器ID
    map2DContainerID;

    //二维地图对象
    #map2D;
    #rectangle;
    #indicatorStyle;

    #Map2DContainerVisibleDisplay;

    get strokeColor() {
        return this.#indicatorStyle.show.color;
    }
    get strokeOpacity() {
        return this.#indicatorStyle.show.opacity;
    }

    get fillColor() {
        return this.#indicatorStyle.show.fillColor;
    }
    get fillOpacity() {
        return this.#indicatorStyle.show.fillOpacity;
    }

    get strokeWidth() {
        return this.#indicatorStyle.show.weight;
    }

    get eagleEyeMap() {
        return this.#map2D;
    }


    constructor(options) {
        super(options);

        this.#indicatorStyle = {
            show: {
                color: JSHelper.IsArray(options.strokeColor) && options.strokeColor.length > 2 ? `rgb(${options.strokeColor[0]},${options.strokeColor[1]},${options.strokeColor[2]})` : (JSHelper.IsString(options.strokeColor) ? options.strokeColor : "rgb(255,0,0)"),
                opacity: options.strokeOpacity || 1,
                fillColor: JSHelper.IsArray(options.fillColor) && options.fillColor.length > 2 ? `rgb(${options.fillColor[0]},${options.fillColor[1]},${options.fillColor[2]})` : (JSHelper.IsString(options.fillColor) ? options.fillColor : "rgb(255,0,0)"),
                fillOpacity: options.fillOpacity || 0.1,
                weight: options.strokeWidth || 1
            },
            hide: {
                fillOpacity: 0,
                opacity: 0
            }
        }

        this.map2DContainerID = options.map2DContainerID;

        this.#map2D = new L.map(this.map2DContainerID, {
            layers: [
                new L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                })
            ],
            minZoom: 0,
            maxZoom: 20,
            zoomControl: false,
            attributionControl: false,
            doubleClickZoom: false,
            dragging: false,
            scrollWheelZoom: false
        })
        this.#map2D.setView([0, 0], 0);

        this.#Map2DContainerVisibleDisplay = this.#map2D._container.style.display;
        if (this.map.sceneMode == 1)
            this.#map2D._container.style.display = "none";


        this._map.mapEvent.on(MapEventType.VIEW_LOADED, this.#mapviewLoaded, this);
    }

    #mapviewLoaded(map) {
        //创建范围指示
        let extent = map.extent;
        this.#rectangle = new L.rectangle([
            [extent[1], extent[0]],
            [extent[3], extent[2]]
        ], this.#indicatorStyle.show).addTo(this.#map2D);
        this.#synchronizeView({ extent: extent });

        this._map.mapEvent.on(MapEventType.EXTENT_CHANGED, this.#synchronizeView, this);
        this.map.mapEvent.on(MapEventType.SCENE_MODE_CHANGED, this.#sceneModeChanged, this);
    }

    //限于2.5D地图范围计算精度问题，暂不支持2.5D鹰眼
    #sceneModeChanged(eventArg) {
        switch (eventArg.sceneMode) {
            case 3:
            case 2:
                this.#map2D._container.style.display = this.#Map2DContainerVisibleDisplay;
                break;
            case 1:
                this.#map2D._container.style.display = "none";
                break;
        }
    }


    //同步视图(仅对2D/3D模式有效)
    #synchronizeView(eventArg) {
        if (this.map.sceneMode == 1)
            return

        if (!eventArg.extent || eventArg.extent.toString() == '-180,-90,180,90') {
            this.#rectangle.setStyle(this.#indicatorStyle.hide);
            this.#map2D.setView([0, 0], 0)
        }
        else {
            let extent = [...eventArg.extent];
            let bounds;
            if (this._map.sceneMode == 3) {
                bounds = new L.LatLngBounds(new L.LatLng(extent[1], extent[0]), new L.LatLng(extent[3], extent[2]));
            }
            else {
                //----2D低层级下,computeRegtangle返回的矩形经度起止顺序要判断
                let cartesian2 = new Cesium.Cartesian2(this._map.viewer.canvas.width / 2, this._map.viewer.canvas.height / 2);
                let screenCenter = this._map.toMap(cartesian2);
                if (screenCenter) {
                    if (!(eventArg.extent[0] < screenCenter[0] && screenCenter[0] < eventArg.extent[2])) {
                        // extent = [eventArg.extent[2], eventArg.extent[1], (eventArg.extent[0] + 360) % 360, eventArg.extent[3]];

                        let a = (extent[0] + 360) % 360;
                        let b = (extent[2] + 360) % 360;
                        screenCenter[0] = (screenCenter[0] + 360) % 360;

                        if (!(a < screenCenter[0] && screenCenter[0] < b)) {
                            extent[0] = b;
                            extent[2] = a > b ? (a + 360) % 360 : a + 360;
                        }
                        else {
                            extent[0] = a;
                            extent[2] = b;
                        }
                    }
                    bounds = new L.LatLngBounds(new L.LatLng(extent[1], extent[0]), new L.LatLng(extent[3], extent[2]));
                }
                else {
                    this.#rectangle.setStyle(this.#indicatorStyle.hide);
                    this.#map2D.setView([0, 0], 0)
                }
            }

            if (bounds) {
                this.#rectangle.setBounds(bounds);
                this.#rectangle.setStyle(this.#indicatorStyle.show);
                this.#map2D.fitBounds(bounds.pad(0.5));
            }
        }
    }
    destrory() {
        this._map = undefined;
    }
}

export { EagleEyeViewModel }