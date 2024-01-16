import { JSHelper } from "../../../libs/JSHelper.js";
import { SymbolType } from "../base/Constants.js";
import { Symbol } from "./Symbol.js"


/**
 * 模型符号
 * 
 * @param {Object} options
 * @param {String} options.url 模型链接
 * @param {Number} [options.scale=1] 缩放系数 
 * @param {Number} [options.minPixelSize=0] 模型大小最小值(像素)
 * @param {Boolean} [options.runAnimations=true] 是否运行动画
 * @param {Array.<Number>} [options.color] 颜色
 * @param {Cesium.ColorBlendMode} [options.colorBlendMode] 混合模式
 * @param {Number} [options.colorBlendAmount=0.5] 混合系数
 *
 * @extends {Symbol}
 */
class MeshSymbol extends Symbol {

    url;
    color;
    colorBlendMode
    colorBlendAmount
    scale;
    minPixelSize;
    orientation;
    runAnimations;
    constructor(options) {
        options = Object.assign({}, options);
        options.type = SymbolType.MESH;
        super(options);

        this.url = options.url;
        this.scale = options.scale || 1;
        this.color = options.color || [255, 255, 255, 1];
        this.colorBlendMode = options.colorBlendMode || Cesium.ColorBlendMode.HIGHLIGHT
        this.colorBlendAmount = options.colorBlendAmount || 0.5;
        this.runAnimations = JSHelper.IsBoolean(options.runAnimations) ? options.runAnimations : true;
        this.minPixelSize = options.minPixelSize || options.minimumPixelSize;
        this.maxScale = options.maxScale || options.maximumScale;
        this.orientation = options.orientation;
    }

    render(entity)
    {
        entity.model = new Cesium.ModelGraphics({
            uri: this.url,
            color: Cesium.Color.fromBytes(this.color[0], this.color[1], this.color[2], Math.min(Math.floor((this.color[4] || 1)) * 255, 255)),
            colorBlendMode: this.colorBlendMode,
            colorBlendAmount: this.colorBlendAmount,
            runAnimations: this.runAnimations,
            scale: this.scale,
            minimumPixelSize: this.minPixelSize,
            maximumScale: this.maxScale
        })
    }
}

export { MeshSymbol }