import { Layer, queueLayer } from "./Layer.js";
import { LayerType, EnumState } from "../base/Constants.js"

/**
 * @summary 影像图层
 *
 * @extends {Layer}
 */
class ImageryLayer extends Layer {
    #icon;//图标
    _isBaseLayer = false;//标识是否是底图图层
    _sourceType;//图源类型

    /**
     * 不透明度
     *
     * @memberof ImageryLayer
     */
    get alpha() {
        return this.delegate.alpha;
    }
    set alpha(value) {
        this.delegate.alpha = value;
    }


    /**
     * 标识是否是底图图层
     *
     * @readonly
     * @memberof ImageryLayer
     */
    get isBaseLayer() {
        return this._isBaseLayer
    }

    get icon() {
        return this.#icon;
    }


    /**
     * 
     * @param {Object} options 配置项
     * @param {Cesium.ImageryProvider} imageryProvider  Cesium.ImageryProvider实例
     * @param {String} [options.id] 图层id
     * @param {String} [options.name=options.id] 图层名
     * @param {Number} [options.alpha=1.0] 图层透明度，取值范围：[0,1],
     * @param {Array.<Number>} [options.extent] 覆盖范围
     * 
     * @constructor
     */
    constructor(options) {
        super(options);
        this._type = LayerType.IMAGERY_LAYER;
        this._sourceType = options.type
        this.#icon = options.icon;

        // if (options.rectangle) {
        //     //rectange may be an object 
        //     options.rectangle = new Cesium.Rectangle(options.rectangle.west, options.rectangle.south, options.rectangle.east, options.rectangle.north);
        // }
        // if (options.extent) {
        //     options.rectangle = Cesium.Rectangle.fromDegrees(...options.extent)
        // }

        this._priority = [0, 1].indexOf(options.priority) > -1 ? options.priority : 2
        // this._delegate = new Cesium.ImageryLayer(options.imageryProvider, options);

        this._delegate = {
            id: this.id,
            type: "raster",
            source: {
                scheme: "xyz", // p.isTMS ? "tms" : "xyz",
                type: "raster",
                tiles: ["https://wprd04.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7"],
                tileSize: 256
            },
            minzoom: 0,
            maxzoom: 24
        };


        this._state = EnumState.INITIALIZED;


        // const tilingSchema=options.tilingSchema;
        // const url=options.url;

        // if(tilingSchema)
        // {
        //     if(typeof url!="string" || url.length==0)
        //     throw   new Error("")
        // }
    }


    // toJSON() {
    //     return JSON.stringify({
    //         type: this.type,
    //         sourceType: this._sourceType,
    //         id: this.id,
    //         layerGroupId: this.layerGroup?.id,
    //         name: this.name,
    //         ignoreByLayerTree: this._ignoreByLayerTree,
    //         visible: this.visible,
    //         pickable: this.pickable,
    //         isBaseLayer: this.isBaseLayer,
    //         alpha: this.delegate.alpha,
    //         lodMinLevel: this.delegate._imageryProvider.minimumLevel,
    //         lodMaxLevel: this.delegate._imageryProvider.maximumLevel,
    //         rectangle: this.delegate.rectangle,
    //     })

    //     // let rectangle
    //     // if (options.rectangle) {
    //     //     //rectange may be an object 
    //     //     rectangle = new Cesium.Rectangle(options.rectangle.west, options.rectangle.south, options.rectangle.east, options.rectangle.north);
    //     // }

    //     // if (options.extent) {
    //     //     rectangle = Cesium.Rectangle.fromDegrees(...options.extent)
    //     // }
    // }



    _setVisible(flag) {
        if (this._state != EnumState.ADDED)
            return;

        this._delegate.show = flag;
        this._visible = flag;

        if (this.map.isRequestRenderMode)
            this._map.requestRender();
    }


    _onAdded(map) {
        //真正添加影像图的指令
        this._map = map;
        // let index = this._isBaseLayer ? this._map.baseLayers.length - 1 : undefined;//for this time layer has been added to layers
        // this._map.viewer.imageryLayers.add(this._delegate, index);

        // let index = (this._isBaseLayer || this._priority === 0) ? this._map.baseLayers.length - 1 : undefined;//for this time layer has been added to layers
        // if (typeof index === "undefined") {
        //     index = this._map.viewer.imageryLayers._layers.filter(p => p._uPriority < 2).length - 1;
        // }
        // this._map.viewer.imageryLayers.add(this._delegate, index);
        // this._delegate._uPriority = this._isBaseLayer ? 0 : this._priority;
        queueLayer(this);


        //状态更新
        this._state = EnumState.ADDED;

        //更新可见性
        this.visible = this._visible;
    }

    _onRemoved(map) {
        //真正移除影像图的指令
        this._map.viewer.imageryLayers.remove(this._delegate, true);//销毁式移除

        //状态更新
        this._map = undefined;
        this._state = EnumState.REMOVED;
    }
}

export { ImageryLayer };