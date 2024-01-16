import { Widget } from "../Widget.js";
import { JSHelper } from "../../../libs/JSHelper.js"
import { BuildInWidgetType } from "../WidgetType.js";
import "./SceneModePicker.css";


/**
 * @summary 鼠标位置指示器。默认显示在地图右下角
 *
 * @extends {Widget}
 */
class SceneModePicker extends Widget {

    _delegate;
    _viewModel;
    _containsHeight;

    get viewModel() {
        return this._viewModel;
    }


    get duration() {
        return this._viewModel.duration;
    }
    set duration(value) {
        this._viewModel.duration = value;
    }


    /**
     *
     * @param {Object} options
     * @param {Map} options.map 关联地图实例
     * @param {String|HTMLElement} options.container 组件容器or容器id
     * @param {Number} [options.duration=2] 切换动画时长
     * @param {String} [options.className] 组件css类名
     * 
     */
    constructor(options) {
        super(options);

        this._container = options.container ? JSHelper.GetElement(options.container) : this.map.ui.topLeftPane;
        this._className = options.className || "sdg-widget-sceneModelPicker";
        //***************注意：如果是自定义 or 第三方组件，请勿赋值该字段******************* */
        this._type = BuildInWidgetType.SCENE_MODE_PICKER;
        //***************************************************************************** */
        this._element = this.createDom(options);
        this._elementDisplayForShow = this._element.style.display;
        this._container.appendChild(this._element);
        this._viewModel = this._delegate.viewModel;
    }

    createDom(options) {
        let element = document.createElement("div");
        element.classList.add("sdg-component", this.className);
        this._delegate = new Cesium.SceneModePicker(element, this.map.viewer.scene, options.duration || 2);
        return element;
    }

    destrory() {
        this._delegate.destroy();
    }


    toJSON() {
        return JSON.stringify({
            type: this.type,
            className: this.className,
            enable: this.enable,
            visible: this.visible,
            duration:this.duration
        })
    }

}

export { SceneModePicker }