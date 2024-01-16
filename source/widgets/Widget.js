import { JSHelper } from "../../libs/JSHelper.js";
import { Map } from "../index.js"

/**
 *@summary 地图组件基类。请勿自行创建该类实例。
 *
 * @class Widget
 */
class Widget {

    _container;
    _element;
    _className;
    _map;
    _enable = true;
    _type;

    _delegate

    _elementDisplayForShow;


    /**
     * 组件容器
     * @type {HTMLElement}
     * @readonly
     * @memberof Widget
     */
    get container() {
        return this._container;
    }


    /**
     * 组件Dom节点
     *
     * @readonly
     * @memberof Widget
     */
    get element() {
        return this._element;
    }


    /**
     * 控件类型
     *
     * @readonly
     * @memberof Widget
     */
    get type() {
        return this._type
    }


    /**
     * 组件Css类名
     *
     * @readonly
     * @memberof Widget
     */
    get className() {
        return this._className;
    }

    get enable() {
        return this._enable;
    }
    set enable(value) {
        this._enable = value;
    }



    get visible() {
        return this._element.style.display != "none"
    }
    set visible(value) {
        this._element.style.display = value ? this._elementDisplayForShow : "none";
    }


    /**
     * 关联地图实例
     * 
     *@type {Map}
    * @readonly
    * @memberof Widget
    */
    get map() {
        return this._map;
    }


    get delegate() {
        return this._delegate
    }


    constructor(options) {
        this._className = options.className;
        this._map = options.map;
        this._enable = typeof options.enable == "boolean" ? options.enable : true;
    }

    /**
     * 创建控件的实际外观(HTML+CSS)
     * 
     * @virtual
     * @memberof Widget
     */
    createDom() {
        console.warn(`method createDom of Widget should be overwriten in subClass`);
        return undefined;
    }


    /**
     *销毁控件
     *
     * @virtual
     * 
     * @memberof Widget
     */
    destrory() {
        console.warn(`method destrory of Widget should be overwriten in subClass`);
    }


    toJSON() {
        return JSON.stringify({
            type: this.type,
            className: this.className,
            enable: this.enable,
            visible: this.visible
        })
    }



}

export { Widget }