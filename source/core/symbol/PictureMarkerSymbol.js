import { Symbol } from "./Symbol.js"

/**
 *
 * 
 * @param {Object} options
 * @param {String} options.image 图片
 * @param {Number} options.width 图片宽度
 * @param {Number} options.height 图片高度
 * @param {Number} [options.xOffset=0] 水平偏移量(像素)
 * @param {Number} [options.yOffset=0] 垂直偏移量（像素）
 * @param {Number} [options.angle=0] 旋转角(弧度)
 * 
 * @extends {Symbol}
 */
class PictureMarkerSymbol extends Symbol {
    width;
    height;
    xOffset;
    yOffset;
    angle;//angle in radian
    image;
    horizontalOrigin;
    verticalOrigin;


    constructor(options) {
        options = Object.assign({}, options);
        options.type = "picture-marker";

        super(options);

        this.image = options.image;
        this.width = options.width
        this.height = options.height
        this.xOffset = options.xOffset || 0;
        this.yOffset = options.yOffset || 0;
        this.angle = options.angle || 0;
        this.scale = options.scale || 1;
        this.horizontalOrigin = options.horizontalOrigin || 0;
        this.verticalOrigin = options.verticalOrigin || 0;
    }


    render(entity) {
        entity.billboard = new Cesium.BillboardGraphics({
            image: this.image,
            width: this.width,
            height: this.height,
            pixelOffset: new Cesium.Cartesian2(this.xOffset, this.yOffset),
            rotation: this.angle
        })
    }
}

export { PictureMarkerSymbol }