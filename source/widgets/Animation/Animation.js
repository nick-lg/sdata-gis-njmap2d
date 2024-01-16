import { Widget } from "../Widget.js";
import { JSHelper } from "../../../libs/JSHelper.js"
import { BuildInWidgetType } from "../WidgetType.js";
import { CesiumHelper } from "../../../libs/CesiumHelper.js";


/**
 *
 * @summary 动画
 *  
 * @extends {Widget}
 */
class Animation extends Widget {

    _viewModel;
    get viewModel() {
        return this._viewModel;
    }

    set visible(value) {
        this._element.style.display = value ? this._elementDisplayForShow : "none";

        if (value) {
            this.delegate.resize();
        }
    }



    /**
     *
     * @param {Object} options
     * @param {Map} options.map 关联地图实例
     * @param {String|HTMLElement} options.container 组件容器or容器id
     * @param {String} [options.className] 组件css类名
     * 
     */
    constructor(options) {
        super(options);


        this._container = options.container ? JSHelper.GetElement(options.container) : document.getElementsByClassName("cesium-viewer")[0];
        // this._className = options.className || "sdg-widget-timeline";


        //***************注意：如果是自定义 or 第三方组件，请勿赋值该字段******************* */
        this._type = BuildInWidgetType.ANIMATION;
        //***************************************************************************** */

        //creaet element
        this._element = this.createDom(options);
        this._elementDisplayForShow = "block"


        this._delegate = this.map.viewer.animation;
        // this._container.appendChild(this._element);

        //apply data binding
        // this._viewModel = this.createDataBinding(options);
    }

    createDom() {
        let d = document.getElementsByClassName("cesium-viewer-animationContainer");
        return d[d.length - 1];
    }


    destrory() {
        this._map = undefined;
        this._delegate.distrory();
    }
}

export { Animation }