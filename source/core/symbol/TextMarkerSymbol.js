import { SymbolType } from "../base/Constants.js";
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
class TextMarkerSymbol extends Symbol {


    text;
    color;
    backgroundColor;
    showBackground;
    font = "16px sans-serif";
    xOffset;
    yOffset;
    horizontalOrigin;
    verticalOrigin



    constructor(options = {}) {
        super(options);
        this.type = SymbolType.TEXT_MARKER
        // this.size = options.size || 12;

        this.color = options.color || [255, 0, 0, 1];
        this.backgroundColor = options.backgroundColor || [255, 255, 255, 1];
        this.showBackground = options.showBackground || false;
        this.xOffset = options.xOffset || 0;
        this.yOffset = options.yOffset || 0;
        this.horizontalOrigin = options.horizontalOrigin || 0;
        this.verticalOrigin = options.verticalOrigin || 0;
    }
}

export { TextMarkerSymbol }