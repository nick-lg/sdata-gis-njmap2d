import { CesiumHelper } from "../../../libs/CesiumHelper.js";
import { Symbol } from "./Symbol.js"


/**
 * 
 * @param {Object} options
 * @param {Number} [options.size=12] 点的大小
 * @param {Array.<Number>} [options.color=[255,0,0,1]] 点的颜色 
 * @param {Array.<Number>} [options.outlineColor=[255, 255, 0, 1] 点的轮廓颜色
 * @param {Number} [options.outlineWidth=0] 点的轮廓宽度
 *
 * @extends {Symbol}
 */
class SimpleMarkerSymbol extends Symbol {

    size
    color;
    outlineColor;
    outlineWidth;

    constructor(options = {}) {
        super(options);
        this.type = "simple-marker";
        this.size = options.size || 12;
        this.color = options.color || [255, 0, 0, 1];
        this.outlineColor = options.outlineColor || [255, 255, 0, 1];
        this.outlineWidth = options.outlineWidth || 0;
    }

    render(entity) {
        entity.point = new Cesium.PointGraphics({
            pixelSize: this.size,
            color: CesiumHelper.RgbaToCesiumColor(this.color),
            outlineColor: CesiumHelper.RgbaToCesiumColor(this.outlineColor),
            outlineWidth: this.outlineWidth
        })
    }
}

export { SimpleMarkerSymbol }