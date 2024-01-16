import { Widget } from "../Widget.js";
import { ZoomButtonViewModel } from "./ZoomButtonViewModel.js";
import { JSHelper } from "../../../libs/JSHelper.js"
import { BuildInWidgetType } from "../WidgetType.js";
import "./ZoomButton.css"


/**
 * @summary 地图缩放按钮。默认显示在地图左上角。
 *
 * @extends {Widget}
 */
class ZoomButton extends Widget {

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
     * 
     */
    constructor(options) {
        super(options);

        this._container = options.container ? JSHelper.GetElement(options.container) : this.map.ui.topLeftPanel;
        this._className = options.className || "sdg-widget-zoomButton";


        //***************注意：如果是自定义 or 第三方组件，请勿赋值该字段******************* */
        this._type = BuildInWidgetType.ZOOM_BUTTON;
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



        const plus = '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M256 112v288M400 256H112"/></svg>';
        const reduce='<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M400 256H112"/></svg>'

        element.innerHTML = `
        <div title='放大' class='sdg-widget-button' data-bind='click:onZoomInClicked'>${plus}</div>
        <div title='缩小' class='sdg-widget-button' data-bind='click:onZoomOutClicked'>${reduce}</div>
        `;



        // element.innerHTML=`<ion-icon name="add"></ion-icon>    `;

 

        return element;
    }

    createDataBinding(options) {
        let viewModel = new ZoomButtonViewModel(options);
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

export { ZoomButton }