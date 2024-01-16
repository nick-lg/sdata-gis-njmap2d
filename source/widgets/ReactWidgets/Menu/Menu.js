import { Menu as AntdMenu } from "antd";
import React from "react";
import ReactDOM from "react-dom";
import { JSHelper } from "../../../../libs/JSHelper.js";
import { TargetType } from "../../../core/base/Constants.js";
import { MapEventType, MouseEventType } from "../../../core/event/EventType.js";
import { Map } from "../../../core/map/Map.js";
import "./Menu.css";
import { DefaultMapMenuItems } from "./DefaultMapMenuItems.js";
import { MenuItemClearSelections } from "./MenuItemClearSelections.js";
import { MenuItemDeleleTarget } from "./MenuItemDeleleTarget.js";
import { MenuItemSelect } from "./MenuItemSelect.js";
import { MenuItemUnSelect } from "./MenuItemUnSelect.js";



/**
 * 菜单基类
 *
 * @extends {React.Component}
 */
class Menu extends React.Component {

    #enable = true;
    #mouseEventArg;

    #removeFuncs = {
        cameraChanged: undefined,
        leftClick: undefined,
        middleClick: undefined,
        rightClick: undefined,
    }
    #preventContextMenu = e => (e.preventDefault());

    // #menuItems;

    /**
    *@type {Map}
    *
    * @readonly
    * @memberof Menu
    */
    get map() {
        return this.props.map;
    }


    /**
     * 子菜单
     *
     * @memberof Menu
     */
    get items() {
        // return this.state.items;
        return this.state.sourceItems;
    }
    set items(value) {
        if (Array.isArray(value)) {
            this.#onItemsAssigned(value);
            // this.setState({ items: value })
            this.setState({ sourceItems: value })
        }
    }


    /**
     * 是否启用菜单
     *
     * @memberof Menu
     */
    get enable() {
        return this.#enable;
    }
    set enable(value) {
        value = Boolean(value);
        if (value == this.#enable)
            return;

        if (value)
            this.#bindEvents()
        else {
            this.#unbindEvents();
            this.visible = value;
        }
        this.#enable = value;
    }


    /**
     * 是否显示菜单
     *
     * @memberof Menu
     */
    get visible() {
        return this.props.container.style.display != "none";
    }
    set visible(value) {
        this.props.container.style.display = value ? "" : "none";
    }

    get mouseEventArg() {
        return this.#mouseEventArg;
    }



    /**
     * @param {String|HTMLElement} props.container 组件容器or容器id
     */


    /**
     * 
     * @param {Object} props
     * @param {String|HTMLElement}  props.container 菜单容器
     * @param {Map} props.map 关联的地图实例
     * @param {CSSProperties} [style={}] 根节点样式
     * @constructor
     */
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            sourceItems: []
        }
    }


    #bindEvents() {
        //禁用浏览器右键菜单
        window.addEventListener("contextmenu", this.#preventContextMenu);
        this.#removeFuncs.cameraChanged = this.map.mapEvent.on(MapEventType.CAMERA_CHANGED, this.#onHideMenu, this);
        this.#removeFuncs.leftClick = this.map.mouseEvent.on(MouseEventType.CLICK, this.#onHideMenu, this);
        this.#removeFuncs.middleClick = this.map.mouseEvent.on(MouseEventType.MIDDLE_CLICK, this.#onHideMenu, this);
        this.#removeFuncs.rightClick = this.map.mouseEvent.on(MouseEventType.RIGHT_CLICK, this.#onShowMenu, this)
    }

    #unbindEvents() {
        Object.values(this.#removeFuncs).forEach(func => {
            func.call();
        })
        window.removeEventListener("contextmenu", this.#preventContextMenu);
    }

    #onHideMenu(e) {
        this.visible = false;
    }

    #onShowMenu(e) {
        this.visible = e.surfacePosition;

        if (!this.visible)
            return;

        this.#mouseEventArg = {
            target: e.target,
            wgs84SurfacePosition: JSHelper.DeepClone(e.wgs84SurfacePosition),
            windowPosition: e.windowPosition?.clone(),
        }


        //----定位
        let p = e.windowPosition.clone();
        this.props.container.style.left = `${p.x}px`
        this.props.container.style.top = `${p.y}px`

        //----构建菜单
        const menuItems = [];
        // let deleteSupported = false;
        // let selecSupported = false;
        // let target;
        // let delegate = e.target?.delegate;
        // if (delegate) {
        //     switch (e.target.type) {
        //         case TargetType.ENTITY:
        //             target = delegate.id;
        //             selecSupported = true;
        //             deleteSupported = true;
        //             break;
        //         case TargetType.PRIMITIVE:
        //         case TargetType.GROUND_PRIMITIVE:
        //         case TargetType.POINT_PRIMITIVE:
        //         case TargetType.MODEL_PRIMITIVE:
        //             target = delegate.primitive;
        //             selecSupported = true;
        //             deleteSupported = true;
        //             break;
        //         case TargetType.CESIUM_3DTILE_FEATURE:
        //             target = delegate;
        //             selecSupported = true;
        //             break;
        //         default:
        //             break;
        //     }

        //     if (target) {
        //         if (selecSupported) {
        //             if (this.map._selections.indexOf(target) > -1) {
        //                 menuItems.push(new MenuItemUnSelect());
        //             }
        //             else {
        //                 menuItems.push(new MenuItemSelect());
        //             }

        //             if (this.map._selections.length > 0) {
        //                 menuItems.push(new MenuItemClearSelections())
        //             }
        //         }

        //         //删除菜单
        //         if (deleteSupported) {
        //             menuItems.push(new MenuItemDeleleTarget())
        //         }

        //     }
        // }
        // else {
        //     //地图响应菜单
        //     this.#menuItems = this.props.menuItems || DefaultMapMenuItems
        //     menuItems.push(...this.#menuItems);
        // }

        // const target = e.target?.delegate




        // this.props.menuItems.forEach(item => {
        //     const condition = eval(item.condition);
        //     // if (condition.call(item, this.#mouseEventArg)) {
        //     //     menuItems.push(item);
        //     // }
        //     if (condition.call(item.context, this.#mouseEventArg)) {
        //         debugger
        //         menuItems.push(item);
        //     }
        // }, this)
        this.state.sourceItems.forEach(item => {
            const condition = item._userdata.condition;
            if (condition(this.#mouseEventArg)) {
                menuItems.push(item);
            }

            // if (condition.call(item, this.#mouseEventArg)) {
            //     menuItems.push(item);
            // }
            // if (condition.call(item.context, this.#mouseEventArg)) {
            //     menuItems.push(item);
            // }
        }, this)
        // this.items = menuItems;
        this.setState({ items: menuItems });
    }

    #onItemsAssigned(items) {
        const self = this;
        items.forEach(ele => {
            ele.map = self.map;
            // ele["mouse-eventArg"] = self.#mouseEventArg
            if (ele.children) {
                self.#onItemsAssigned(ele.children)
            }
            // else if (ele.onClick) {
            //     ele.map = self.map;
            // }
        })
    }


    destrory() {
        ReactDOM.unmountComponentAtNode(this.props.container);
        this.#unbindEvents();
        this.map._menu = undefined;

    }

    render() {
        return <AntdMenu style={this.props.style || {}} items={this.state.items}></AntdMenu>
    }


    componentDidMount() {
        this.map.menu?.destrory();
        this.map._menu = this;
        this.#bindEvents();
        this.items = Array.isArray(this.props.menuItems) ? [...this.props.menuItems] : [];
    }

    // __onAdded(map) {
    //     map.menu?.destrory();
    //     map._menu = this;
    //     this.#bindEvents();
    // }
}
export { Menu };
