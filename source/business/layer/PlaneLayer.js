import { PointLayer } from "../../core/layer/PointLayer.js";
import { SimpleRenderer } from "../../core/renderer/SimpleRenderer.js"
import { PictureMarkerSymbol } from "../../core/symbol/PictureMarkerSymbol.js"
import fight_red_img from "../../assets/image/fighter-red.png";
import { Popup } from "../../overlay/Popup.js";


/**
 *
 *
 * @summary 用于飞机点位渲染的专用图层
 * @extends {PointLayer}
 */
class PlaneLayer extends PointLayer {

    _popups = [];
    _removeFeaturePickedHandler;


    /**
     * @summary  PlaneLayer
     * @param {Object} options
     * @param {String} [options.id=GUID] 图层id
     * @param {String} [options.name=options.id] 图层名
     * @param {Renderer} [options.render=new SimpleRenderer({symbol: new PictureMarkerSymbol({image: fight_red_img,width: 20,height: 20})})] 渲染器
     */
    constructor(options) {
        options.renderer = options.renderer || new SimpleRenderer({
            symbol: new PictureMarkerSymbol({
                image: fight_red_img,
                width: 20,
                height: 20
            })
        });
        super(options);
    }

    // /**
    // * 绑定弹窗
    // *
    // * @param {*} target
    // * @param {Object} options
    // * @param {String|HTMLElement|ReactComponent|Function} [options.content] 弹窗内容 or 渲染函数
    // * @param {String} [options.className="sdg-popup"] 弹窗元素的css className
    // * @param {String} [options.horizontalOrigin="left"] 水平对齐原点，可选值："left"、"center"、"right"
    // * @param {String} [options.verticalOrigin="bottom"] 纵向对齐原点，可选值："left"、"center"、"right"
    // * @param {Number} [options.offsetX=0] 水平偏移量(px)
    // * @param {Number} [options.offsetY=0] 纵向偏移量(px)
    // * @param {Boolean} [options.closeBtn=false] 是否创建关闭按钮
    // * @param {Boolean} [options.destroryAfterClose=true] 关闭后是否销毁弹窗
    // * @return {*} 
    // * @memberof PlaneLayer
    // */
    bindPopup(target, { content, className, offsetX, offsetY, closeBtn, update }) {
        if (!this.map || !target || target.uLayer != this)
            return;
        if (!target.uPopup) {
            let popup = new Popup()
            popup.bind(target, update);
            this.map.addOverlay(popup);
        }
        if (target.show) {
            let location = target.position.getValue(this._map._viewer.clock.currentTime).clone();
            target.uPopup.open({
                className: className,
                location: location,
                content: content,
                horizontalOrigin: "left",
                verticalOrigin: "bottom",
                offsetX: offsetX,
                offsetY: offsetY,
                closeBtn: closeBtn,
                destroryAfterClose: true,
            })
        }
        else
            target.uPopup.close();
    }
}
export { PlaneLayer }