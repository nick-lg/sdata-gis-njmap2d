import { JSHelper } from "../../libs/JSHelper.js";
import { NotifySizeChangedArray } from "../core/base/NotifySizeChangedArray.js";
import { Map } from "../core/map/Map.js";
import { Attribution } from "./Attribution/Attribution.js";
import { EagleEye } from "./EagleEye/EagleEye.js";
import { HomeButton } from "./HomeButton/HomeButton.js";
import { LayerTree } from "./ReactWidgets/LayerTree/LayerTree.js"
import { LocationBar } from "./LocationBar/LocationBar.js";
import { ScaleBar } from "./ScaleBar/ScaleBar.js";
import { Widget } from "./Widget.js";
import { BuildInWidgetType } from "./WidgetType.js";
import { ZoomButton } from "./ZoomButton/ZoomButton.js";

// 引入and-desin样式
import "antd/dist/antd.css"
//引入全局组件基本样式
import './widget.css'


import React from "react";
import * as ReactDOM from "react-dom/client";
import { Menu } from "./ReactWidgets/Menu/Menu.js";
import { SceneModePicker } from "./SceneModePicker/SceneModePicker.js";
import { Timeline } from "./Timeline/Timeline.js";
import { Animation } from "./Animation/Animation.js";


/**
 * @summary 地图组件管理器
 *
 */
class WidgetManager {
    #widgets = new NotifySizeChangedArray();

    #map;
    #container;
    #topLeftPane;
    #topRightPane;
    #bottomLeftPane;
    #bottomRightPane;
    #popupContainer;
    #menuContainer;

    /**
     *
     * @type {Map}
     *
     * @readonly
     * @memberof WidgetManager
     */
    get map() {
        return this.#map;
    }


    /**
     * 顶级UI容器(指向.cesium-viewer) 
     * 
     * @type {HTMLElement}
     * @readonly
     * @memberof WidgetManager
     */
    get container() {
        return this.#container;
    }


    /**
     * 二级左上角窗格
     *
     * @readonly
     * @memberof WidgetManager
     */
    get topLeftPane() {
        return this.#topLeftPane;
    }


    /**
     *二级右上角窗格
     *
     * @readonly
     * @memberof WidgetManager
     */
    get topRightPane() {
        return this.#topRightPane;
    }


    /**
     * 二级左下角窗格
     *
     * @readonly
     * @memberof WidgetManager
     */
    get bottomLeftPane() {
        return this.#bottomLeftPane;
    }


    /**
     *二级右下角窗格
     *
     * @readonly
     * @memberof WidgetManager
     */
    get bottomRightPane() {
        return this.#bottomRightPane;
    }


    get popupContainer() {
        return this.#popupContainer;
    }

    get menuContainer() {
        return this.#menuContainer;
    }




    /**
     * 地图组件列表
     *
     * @readonly
     * @memberof WidgetManager
     */
    get widgets() {
        return [...this.#widgets];
    }


    /**
     *
     * @param {Map} map
     * @memberof WidgetManager
     * @constructor
     */
    constructor(map) {
        this.#map = map;

        //dom布局初始化
        this.#initDom();

        //----注册控件集合更改回调
        this.#widgets.addHandler((obj) => {
            let isAddOption = ["push", "unshift"].indexOf(obj.type) > -1 ? true : false;
            let widgets = obj.data;
            // let rendered;
            let root;
            widgets.forEach(widget => {
                if (isAddOption) {
                    //添加组件
                    //--特殊处理：挂载react组件
                    if (widget instanceof React.Component) {
                        widget = React.createElement(widget.constructor, widget.props || {});
                    }

                    if (React.isValidElement(widget)) {
                        if (widget.type.name == "Menu") {
                            let oldProps = widget.props ? widget.props : {};
                            let props = Object.assign({}, oldProps)
                            props = {
                                ...oldProps,
                                map: this.map,
                                container: oldProps.container || this.map.ui.menuContainer
                            }
                            widget = React.createElement(Menu, props);
                        }
                        if (!widget.props.container)
                            return;
                        // rendered = ReactDOM.render(widget, widget.props.container);
                        root = ReactDOM.createRoot(widget.props.container);
                        root.render(widget);
                    }
                }
                else {
                    //移除组件
                    widget.destrory();
                }
            });
        })
    }

    #initDom() {
        let cesiumViewerContainer = this.map.container.querySelector(".cesium-viewer");

        //popup容器
        this.#popupContainer = document.createElement("div");
        this.#popupContainer.className = "sdg-ui-popupContainer"
        cesiumViewerContainer.appendChild(this.popupContainer);

        //菜单容器
        this.#menuContainer = document.createElement("div");
        this.#menuContainer.className = "sdg-ui-menuContainer"
        cesiumViewerContainer.appendChild(this.menuContainer);

        //设置顶级控件容器
        this.#container = document.createElement("div");
        this.#container.className = "sdg-ui-inner-container";
        this.#container.innerHTML = `<div class="sdg-ui-top-left sdg-ui-corner"></div>
        <div class="sdg-ui-top-right sdg-ui-corner"></div>
        <div class="sdg-ui-bottom-left sdg-ui-corner"></div>
        <div class="sdg-ui-bottom-right sdg-ui-corner"></div>`;
        cesiumViewerContainer.appendChild(this.#container);

        // 设置四个顶角窗格
        const mapContainerID = this.map.viewer.container.id;
        this.#topLeftPane = document.querySelector(`#${mapContainerID} .sdg-ui-top-left.sdg-ui-corner`);
        this.#topRightPane = document.querySelector(`#${mapContainerID} .sdg-ui-top-right.sdg-ui-corner`);
        this.#bottomLeftPane = document.querySelector(`#${mapContainerID} .sdg-ui-bottom-left.sdg-ui-corner`);
        this.#bottomRightPane = document.querySelector(`#${mapContainerID} .sdg-ui-bottom-right.sdg-ui-corner`);


        // this.#topLeftPane = document.querySelector(".sdg-ui-top-left.sdg-ui-corner");
        // this.#topRightPane = document.querySelector(".sdg-ui-top-right.sdg-ui-corner");
        // this.#bottomLeftPane = document.querySelector(".sdg-ui-bottom-left.sdg-ui-corner");
        // this.#bottomRightPane = document.querySelector(".sdg-ui-bottom-right.sdg-ui-corner");


    }



    /**
     * 添加控件
     *
     * @param {String|Widget|React.ReactElement|React.JSXElementConstructor} widget 要添加的控件
     * @return {Widget|React.CElement} 
     * @memberof WidgetManager
     */
    add(widget) {
        let widgetTypeCode = WidgetManager.GetWidgetCode(widget);
        let delegate;
        switch (widgetTypeCode) {
            case 0:     //不识别的控件
                console.warn(`invalid widget`);
                break;
            case 1:  //按名称添加内置组件
                delegate = WidgetManager.CreateBuiltInWidgetByName(widget, this.#map);
                break;
            case 2://原生Widget实例
                widget._map = this.map;
                delegate = widget;
                break;
            case 3://react控件
                // widget._map = this.map;
                delegate = widget;
                break;
            default:
                break;
        }

        if (delegate)
            this.#widgets.push(delegate);
        return delegate;
    }


    /**
     * 移除组件
     *
     * @param {*} widget
     * @return {*} 
     * @memberof WidgetManager
     */
    remove(widget) {
        let widgetTypeCode = WidgetManager.GetWidgetCode(widget);
        if (widgetTypeCode == 0)
            return;
        let element;
        for (let i = this.#widgets.length - 1; i >= 0; i--) {
            element = this.#widgets[i];
            if (widgetTypeCode == 1 ? element.type == widget : element == widget) {
                this.#widgets.splice(i, 1);
            }
        }
    }



    /**
     * 获取指定名称的控件
     *
     * @param {String} name
     * @return {Widget|Object|undefined} 
     * @memberof WidgetManager
     */
    getWidgetByName(name) {
        if (!name)
            return;

        name = name.replaceAll("_", "").toLowerCase();
        let element;
        for (let i = 0; i < this.widgets.length; i++) {
            element = this.widgets[i];
            if (element instanceof Widget) {
                if (element.type.replaceAll("_", "").toLowerCase() == name)
                    return element;
            }
            else {
                if (element.type?.name?.toLowerCase() == name)
                    return element;
            }
        }
    }



    /**
     * 获取控件码(1:字符串指定的内置控件；2：内置控件实例；3：接口检查通过的自定义控件；0:不识别的控件 )
     *
     * @static
     * @param {*} widget
     * @return {Number} 
     * @memberof WidgetManager
     */
    static GetWidgetCode(widget) {
        //字符串指定的内置控件
        if (JSHelper.IsString(widget) && Object.values(BuildInWidgetType).indexOf(widget) > -1) {
            return 1;
        }
        //内置控件实例
        if (widget instanceof Widget)
            return 2;
        //React 控件
        if (React.isValidElement(widget) || widget instanceof React.Component) {
            return 3;
        }
        //不识别的控件
        else
            return 0;
    }



    /**
     * 根据名称创建内置地图控件
     *
     * @static
     * @param {String} name 组件类型名称
     * @param {Map} map 地图实例
     * @return {Widget|React.CElement} 
     * @memberof WidgetManager
     */
    static CreateBuiltInWidgetByName(name, map) {
        let widget;
        let options;
        switch (name) {
            case BuildInWidgetType.HOME_BUTTON:
                options = {
                    container: map.ui.#topLeftPane,
                    map: map,
                    duration: 0.8,
                }
                widget = new HomeButton(options);
                break;
            case BuildInWidgetType.ZOOM_BUTTON:
                options = {
                    container: map.ui.#topLeftPane,
                    map: map,
                }
                widget = new ZoomButton(options);
                break;
            case BuildInWidgetType.SCENE_MODE_PICKER:
                options = {
                    container: map.ui.#topLeftPane,
                    map: map,
                    duration: 1
                }
                widget = new SceneModePicker(options);
                break;
            case BuildInWidgetType.LOCATION_BAR:
                options = {
                    container: map.ui.#container,
                    map: map,
                    decimals: 6,
                    containsHeight: true,
                }
                widget = new LocationBar(options);
                break;
            case BuildInWidgetType.SCALE_BAR:
                options = {
                    container: map.ui.#bottomLeftPane,
                    map: map,
                }
                widget = new ScaleBar(options);
                break;
            case BuildInWidgetType.EAGLE_EYE:
                options = {
                    container: map.ui.#bottomRightPane,
                    map: map,
                    width: 160,
                    height: 160,
                    strokeColor: "rgb(255,0,0)",
                    strokeOpacity: 1,
                    strokeWidth: 1,
                    fillColor: "rgb(255,0,0)",
                    fillOpacity: 0.1,
                }
                widget = new EagleEye(options);
                break;
            case BuildInWidgetType.ATTRIBUTION:
                options = {
                    container: map.ui.#container,
                    map: map,
                }
                widget = new Attribution(options);
                break;
            case BuildInWidgetType.TIMELINE:
                options = {
                    map: map,
                }
                widget = new Timeline(options);
                break;
            case BuildInWidgetType.ANIMATION:
                options = {
                    map: map,
                }
                widget = new Animation(options);
                break;
            case BuildInWidgetType.LAYER_TREE:
                options = {
                    container: map.ui.topRightPane,
                    map: map,
                }
                widget = React.createElement(LayerTree, options)
                break;
            case BuildInWidgetType.MENU:
                options = {
                    container: map.ui.menuContainer,
                    map: map,
                }
                widget = React.createElement(Menu, options)
                break;
            default:
                throw new Error(`create built-in widget failed: unrecognized widget name->${name}`)
        }
        return widget;
    }
}
export { WidgetManager }