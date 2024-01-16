import { Widget } from "../Widget.js";
import { JSHelper } from "../../../libs/JSHelper.js"
import { BuildInWidgetType } from "../WidgetType.js";
import { CesiumHelper } from "../../../libs/CesiumHelper.js";


/**
 *
 * @summary 主视图按钮。默认显示在地图左上角
 *  
 * @extends {Widget}
 */
class Timeline extends Widget {

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
        this._type = BuildInWidgetType.TIMELINE;
        //***************************************************************************** */

        //creaet element
        this._element = this.createDom(options);
        this._elementDisplayForShow = "block"


        this._delegate = this.map.viewer.timeline;

        // this._container.appendChild(this._element);

        //apply data binding
        // this._viewModel = this.createDataBinding(options);
    }

    createDom() {
        const d = document.getElementsByClassName("cesium-viewer-timelineContainer");
        return d[d.length - 1];
    }

    createDataBinding(options) {
        // let viewModel = new HomeButtonViewModel(options);
        // Cesium.knockout.track(viewModel);
        // Cesium.knockout.applyBindings(viewModel, this._element);
        // return viewModel;
    }

    destrory() {
        // Cesium.knockout.cleanNode(this._element);
        // this.viewModel.destrory();
        // this._container.removeChild(this._element)

        this._map = undefined;
        this._delegate.distrory();
    }
}

export { Timeline }