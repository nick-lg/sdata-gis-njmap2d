import { Widget } from "../Widget.js";
import { LocationBarViewModel } from "./LocationBarViewModel.js";
import { JSHelper } from "../../../libs/JSHelper.js"
import { BuildInWidgetType } from "../WidgetType.js";
import "./LocationBar.css";


/**
 * @summary 鼠标位置指示器。默认显示在地图右下角
 *
 * @extends {Widget}
 */
class LocationBar extends Widget {

    _viewModel;
    _containsHeight;

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

        this._containsHeight = options.containsHeight || false;
        this._container = options.container ? JSHelper.GetElement(options.container) : this.map.ui.container;
        this._className = options.className || "sdg-widget-locationBar";


        //***************注意：如果是自定义 or 第三方组件，请勿赋值该字段******************* */
        this._type = BuildInWidgetType.LOCATION_BAR;
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
        element.classList.add( this._className)
        // element.innerHTML = `经度: <span data-bind="text:lng"> </span>纬度: <span data-bind="text:lat"> </span>海拔: <span data-bind="text:alt"></span>`;
        element.innerHTML = `经度: <span data-bind="text:lng"> </span>纬度: <span data-bind="text:lat"> ${this._containsHeight ? '</span>海拔: <span data-bind="text:alt"></span>' : ''}`;

        return element;
    }

    createDataBinding(options) {
        let viewModel = new LocationBarViewModel(options);
        Cesium.knockout.track(viewModel);
        Cesium.knockout.applyBindings(viewModel, this._element);

        return viewModel;
    }

    destrory() {
        Cesium.knockout.cleanNode(this._element);
        this.viewModel.destrory();
        this._container.removeChild(this._element)
    }

    // #watch(name) {
    //     Cesium.knockout.getObservable(this._viewModel, name).subscribe(function (value) {
    //        
    //         m[name] = value;
    //     });
    // }
}

export { LocationBar }