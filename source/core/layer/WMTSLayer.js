import { ImageryLayer } from "./ImageryLayer.js";
import { LayerType } from "../base/Constants.js"
import { JSHelper } from "../../../libs/JSHelper.js";

/**
 * 
 * @param {Object} options 配置项
 * @param {String} options.url 瓦片链接
 * @param {String} options.tileMatixSet 瓦片矩阵
 * @param {Array} [options.tileMatrixLabels] tileMatrix标识数组
 * @param {String} [options.style="default"] 样式名
 * @param {String} [options.tilingType=0] 切片类型，可选值：0、1
 * @param {Interger} [options.lodMinLevel=0] LOD最小层级
 * @param {Interger} [options.lodMaxLevel=20] LOD最大层级
 * @param {String} [options.id] 图层id
 * @param {String} [options.name=options.id] 图层名
 * @param {Number} [options.alpha=1.0] 图层透明度，取值范围：[0,1],
 * @param {Integer} [options.priority=2] 图层优先级,可选值：0、1、2. 0为最高优先级
 * @param {Array<Number>} [options.extent] 范围,形如[xmin,ymin,xmax,ymax]
 *
 * @class WMTSLayer
 * @extends {ImageryLayer}
 */
class WMTSLayer extends ImageryLayer {
    get url() {
        return this._delegate?._imageryProvider?.url
    }

    constructor(options = {}) {
        const levels = [
            JSHelper.IsInteger(options.lodMinLevel) ? options.lodMinLevel : 0,
            JSHelper.IsInteger(options.lodMaxLevel) ? options.lodMaxLevel : 20,
        ]

        options.imageryProvider = new Cesium.WebMapTileServiceImageryProvider({
            url: options.url,
            tileMatrixSetID: options.tileMatrixSet,
            tileMatrixLabels: options.tileMatrixLabels ?? Object.keys(Array(23).fill()),
            style: options.style ?? "default",
            layer: options.layer ?? "layer",
            tilingScheme: options.tilingType ? new Cesium.GeographicTilingScheme() : new Cesium.WebMercatorTilingScheme(),
            minimumLevel: levels[0],
            maximumLevel: levels[1]
        })

        super(options);
        this._type = LayerType.WMTS_LAYER;
    }

    // toJSON() {
    //     return JSON.stringify({
    //         type: this.type,
    //         id: this.id,
    //         layerGroupId: this.layerGroup?.id,
    //         name: this.name,
    //         ignoreByLayerTree: this._ignoreByLayerTree,
    //         visible: this.visible,
    //         pickable: false,
    //         isBaseLayer: this.isBaseLayer,
    //         alpha: this.delegate.alpha,
    //         url: this.url,
    //         tileType: this.tileType,
    //         correct: this.#correct,
    //         lodMinLevel: this.delegate._imageryProvider.minimumLevel,
    //         lodMaxLevel: this.delegate._imageryProvider.maximumLevel,
    //         rectangle: this.delegate.rectangle
    //     })
    // }
}

export { WMTSLayer }