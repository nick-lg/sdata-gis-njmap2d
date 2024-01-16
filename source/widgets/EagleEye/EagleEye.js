import { Widget } from "../Widget.js";
import { EagleEyeViewModel } from "./EagleEyeViewModel.js";
import { JSHelper } from "../../../libs/JSHelper.js"
import { BuildInWidgetType } from "../WidgetType.js";
import "./EagleEye.css";



/**
 * @summary 鹰眼组件(不支持2.5D)。默认显示在地图右下角
 *
 * @extends {Widget}
 */
class EagleEye extends Widget {

    _domID;//leaflet要求必须提供id
    _viewModel;

    get domID() {
        return this._domID;
    }

    get viewModel() {
        return this._viewModel;
    }


    #width;
    #height;

    get width() {
        return this.#width;
    }
    get height() {
        return this.#height;
    }


    /**
     *
     * @param {Object} options
     * @param {Map} options.map 关联地图实例
     * @param {String|HTMLElement} options.container 组件容器or容器id
     * @param {String} [options.className] 组件css类名
     * @param {Number} [options.width=160] 宽度
     * @param {Number} [options.height=160] 高度
     * @param {Number} [options.strokeColor='rgb(255,0,0)'] 边框颜色
     * @param {Number} [options.strokeOpacity=1] 边框不透明度
     * @param {Number} [options.strokeWidth=1] 边框宽度
     * @param {Number} [options.fillColor='rgb(255,0,0)'] 填充色
     * @param {Number} [options.fillOpacity=0.1] 填充色不透明度
     * 
     */
    constructor(options) {
        super(options);

        this._container = options.container ? JSHelper.GetElement(options.container) : this.map.ui.container;
        this._className = options.className || "sdg-widget-eagleEye";
        this._domID = JSHelper.GenerateGUID();
        this.#width = options.width || 160;
        this.#height = options.height || 160;

        //***************注意：如果是自定义 or 第三方组件，请勿赋值该字段******************* */
        this._type = BuildInWidgetType.EAGLE_EYE;
        //***************************************************************************** */

        //creaet element
        this._element = this.createDom(options);
        this._element.setAttribute("id", this._domID);
        this._elementDisplayForShow = this._element.style.display;

        this._container.appendChild(this._element);

        //apply data binding
        this._viewModel = this.createDataBinding(options);
    }

    createDom() {
        let element = document.createElement("div");
        element.classList.add("sdg-component", this.className);
        element.style.width = this.#width + "px";
        element.style.height = this.#height + "px";
        return element;
    }

    createDataBinding(options) {
        options.map2DContainerID = this._domID;
        let viewModel = new EagleEyeViewModel(options);
        Cesium.knockout.track(viewModel);
        Cesium.knockout.applyBindings(viewModel, this._element);

        return viewModel;
    }

    destrory() {
        Cesium.knockout.cleanNode(this._element);
        this.viewModel.destrory();
        this._container.removeChild(this._element)
    }

    toJSON() {
        return JSON.stringify({
            type: this.type,
            className: this.className,
            enable: this.enable,
            visible: this.visible,
            height: this.height,
            width: this.width
        })
    }
}

export { EagleEye }