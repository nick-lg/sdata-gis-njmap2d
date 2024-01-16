import { Widget } from "../Widget.js";
import { HomeButtonViewModel } from "./HomeButtonViewModel.js";
import { JSHelper } from "../../../libs/JSHelper.js"
import { BuildInWidgetType } from "../WidgetType.js";
import "./HomeButton.css"


/**
 *
 * @summary 主视图按钮。默认显示在地图左上角
 *  
 * @extends {Widget}
 */
class HomeButton extends Widget {

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
     * @param {String} [options.url] logo
     * @param {Number} [options.duration=0.8] 主视图跳转动画时长(秒)
     * 
     */
    constructor(options) {
        super(options);

        this._container = options.container ? JSHelper.GetElement(options.container) : this.map.ui.topLeftPanel;
        this._className = options.className || "sdg-widget-homeButton";


        //***************注意：如果是自定义 or 第三方组件，请勿赋值该字段******************* */
        this._type = BuildInWidgetType.HOME_BUTTON;
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
        element.classList.add("sdg-component", this.className);
        const icon = '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><title>Home</title><path d="M80 212v236a16 16 0 0016 16h96V328a24 24 0 0124-24h80a24 24 0 0124 24v136h96a16 16 0 0016-16V212" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" /><path d="M480 256L266.89 52c-5-5.28-16.69-5.34-21.78 0L32 256M400 179V64h-48v69" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" /></svg>';
        element.innerHTML = `<div title='主视点' class='sdg-widget-button' data-bind='click:goHome'>${icon}</div>`;
        return element;
    }

    createDataBinding(options) {
        let viewModel = new HomeButtonViewModel(options);
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

export { HomeButton }