import { JSHelper } from "../../../libs/JSHelper.js";
import { LayerType, EnumState } from "../base/Constants.js";
import { Layer } from "./Layer.js";


/**
 * 渲染栅格瓦片的通用图层
 * 
 * @param {Object} options 配置项
 * @param {String} options.url 瓦片链接
 * @param {String} [options.tileType="normal"] 瓦片类型,可选值："normal","tms"
 * @param {Interger} [options.lodMinLevel=2] LOD最小层级
 * @param {Interger} [options.lodMaxLevel=20] LOD最大层级
//  * @param {Array.<Number>} [options.extent] 覆盖范围
 * @param {String} [options.id] 图层id
 * @param {String} [options.name=options.id] 图层名
//  * @param {Number} [options.alpha=1.0] 图层透明度，取值范围：[0,1]
//  * @param {Boolean} [options.correct=undefined] 是否应用纠偏处理。仅对gaode-xxx、baidu-xxx有效
//  * @param {Integer} [options.priority=2] 图层优先级,可选值：0、1、2. 0为最高优先级
 *
 * @class TileLayer
 * 
 * @extends {Layer}
 */
class TileLayer extends Layer {

    #tileType;
    #correct;
    _isBaseLayer = false;//标识是否是底图图层
    _sourceType;//图源类型
    #url;

    get url() {
        return this.#url;
    }

    get tileType() {
        return this.#tileType || "normal";
    }

    /**
   * 标识是否是底图图层
   *
   * @readonly
   * @memberof TileLayer
   */
    get isBaseLayer() {
        return this._isBaseLayer
    }


    constructor(options = {}) {
        // options.imageryProvider = createImageryProvider(options);
        super(options);
        // this._type = LayerType.TILE_LAYER;
        // this._sourceType = options.type
        // this._delegate = new Cesium.TileLayer(options?.imageryProvider, options);
        // this._state = EnumState.INITIALIZED;

        this.#url = options.url;
        this._type = LayerType.TILE_LAYER;
        this.#tileType = options.tileType || "normal";
        // this.#correct = options.correct;

        if (typeof options.isBaseLayer == "boolean") {
            this._isBaseLayer = options.isBaseLayer
        }



        this._priority = [0, 1].indexOf(options.priority) > -1 ? options.priority : 2;

        const levels = [
            JSHelper.IsInteger(options.lodMinLevel) ? options.lodMinLevel : 2,
            JSHelper.IsInteger(options.lodMaxLevel) ? options.lodMaxLevel : 20,
        ]

        const pattern = /^(https?:\/\/)?([\w.-]+\.[a-zA-Z]{2,})(\/[\w.-]*)*\/?$/;
        if (pattern.test(options.url) || options.url.indexOf("localhost") > -1 || options.url.indexOf("127.0.0.1") > -1 || options.url.indexOf(":") > -1) {
            this._delegate = {
                id: this.id,
                type: "raster",
                source: {
                    scheme: this.#tileType == "normal" ? "xyz" : "tms",   // p.isTMS ? "tms" : "xyz",
                    type: "raster",
                    tiles: [this.url],//https://wprd04.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7
                    tileSize: 256
                },
                minzoom: levels[0],
                maxzoom: levels[1]
            };
        }
        else {
            this._isNJLayer = true;
            this._delegate = new GeoGlobe.NJLayer(this.#url);
        }
        this._state = EnumState.INITIALIZED;
    }




    _onAdded(map) {
        //真正添加影像图的指令
        this._map = map;

        //     // var dt_layer = new GeoGlobe.NJLayer("esri_vec_dt_public");
        //     // map.loadSprite(dt_layer.sprite);
        //     // map.style.setGlyphs(dt_layer.glyphs);

        if (this._delegate.sprite)
            this._map.viewer.loadSprite(this._delegate.sprite);
        if (this._delegate.glyphs)
            this._map.viewer.setGlyphs(this._delegate.glyphs);

        if (this._isBaseLayer)
            this._map.viewer.addLayerToGroup(this.delegate, "basemap");
        else
            this._map.viewer.addLayer(this.delegate);


        // let index = this._isBaseLayer ? this._map.baseLayers.length - 1 : undefined;//for this time layer has been added to layers
        // this._map.viewer.imageryLayers.add(this._delegate, index);

        // let index = (this._isBaseLayer || this._priority === 0) ? this._map.baseLayers.length - 1 : undefined;//for this time layer has been added to layers
        // if (typeof index === "undefined") {
        //     index = this._map.viewer.imageryLayers._layers.filter(p => p._uPriority < 2).length - 1;
        // }
        // this._map.viewer.imageryLayers.add(this._delegate, index);
        // this._delegate._uPriority = this._isBaseLayer ? 0 : this._priority;
        // queueLayer(this);


        //状态更新
        this._state = EnumState.ADDED;

        //更新可见性
        this.visible = this._visible;
    }

    _onRemoved(map) {
        //真正移除影像图的指令
        this._map.viewer.removeLayerAndSource(this.delegate.id);


        //状态更新
        this._map = undefined;
        this._state = EnumState.REMOVED;
    }

    _setVisible(flag) {
        if (this._state != EnumState.ADDED)
            return;
        this._map.viewer[flag ? "showLayer" : "hideLayer"](this._isNJLayer ? this._delegate.id : this._id);
        this._visible = flag;
    }

}




export { TileLayer };
