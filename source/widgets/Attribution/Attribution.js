import { Widget } from "../Widget.js";
import { JSHelper } from "../../../libs/JSHelper.js"
import { BuildInWidgetType } from "../WidgetType.js";
import { AttributionViewModel } from "./AttributionViewModel.js";
import "./Attribution.css"


/**
 * @summary 版权组件。默认显示在地图左下角
 *
 * @extends {Widget}
 */
class Attribution extends Widget {

    _viewModel;

    get viewModel() {
        return this._viewModel;
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

        this._container = options.container ? JSHelper.GetElement(options.container) : this.map.ui.container;
        this._className = options.className || "sdg-widget-attribution";



        //***************注意：如果是自定义 or 第三方组件，请勿赋值该字段******************* */
        this._type = BuildInWidgetType.ATTRIBUTION;
        //***************************************************************************** */

        //creaet element
        this._element = this.createDom(options);
        this._elementDisplayForShow = this._element.style.display;
        this._container.appendChild(this._element);

        //apply data binding
        this._viewModel = this.createDataBinding(options);
    }

    createDom() {
        let element = document.createElement("div");
        element.className = this._className;

        element.innerHTML = `
        <div class="sdg-widget-attribution-logoContainer" style="display: inline;">
            <div style="display: inline;">
                <a  data-bind='attr:{href:href}' target="_blank">
                    <img title="Smardaten" data-bind='attr:{src:logoUrl}'>
                </a>
            </div>
        </div>
        <div class="sdg-widget-attribution-textContainer" style="display: inline;">
            <div style="display: inline;"><b data-bind='html:text'></b></div>
        </div>`;
        return element;
    }

    createDataBinding(options) {
        let viewModel = new AttributionViewModel(options);
        Cesium.knockout.track(viewModel);
        Cesium.knockout.applyBindings(viewModel, this._element);
        return viewModel;
    }

    destrory() {
        Cesium.knockout.cleanNode(this._element);
        this.viewModel.destrory();
        this._container.removeChild(this._element)
    }


    
}

export { Attribution }