import { Widget } from "../Widget.js";
import { JSHelper } from "../../../libs/JSHelper.js"
import { BuildInWidgetType } from "../WidgetType.js";
import { ScaleBarViewModel } from "./ScaleBarViewModel.js";
import "./ScaleBar.css"


/**
 * @summary 比例尺。默认显示在地图左下角。
 *
 * @class ScaleBar
 * @extends {Widget}
 */
class ScaleBar extends Widget {

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
        this._className = options.className || "sdg-widget-scaleBar";

        //***************注意：如果是自定义 or 第三方组件，请勿赋值该字段******************* */
        this._type = BuildInWidgetType.SCALE_BAR;
        //***************************************************************************** */

        //creaet element
        this._element = this.createDom(options);
        this._elementDisplayForShow=this._element.style.display;
        this._container.appendChild(this._element);

        //apply data binding
        this._viewModel = this.createDataBinding(options);

        

    }

    createDom() {
        let element = document.createElement("div");
        element.classList.add("sdg-component", this.className);
        element.setAttribute("data-bind","visible: distanceLabel && barWidth");
        element.innerHTML =
            `<div class="sdg-widget-scaleBar-label" data-bind="text: distanceLabel"></div>
             <div class="sdg-widget-scaleBar-rule" data-bind="style: { width: barWidth + 'px', left: (5 + (125 - barWidth) / 2) + 'px' }"></div>'`

        return element;
    }

    createDataBinding(options) {
        let viewModel = new ScaleBarViewModel (options);
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

export { ScaleBar }