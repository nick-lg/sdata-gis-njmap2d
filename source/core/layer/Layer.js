import { JSHelper } from "../../../libs/JSHelper.js"
import { LayerEventType } from "../event/EventType.js";
import { LayerEvent } from "../event/LayerEvent.js";
import { Map } from "../map/Map.js"

/**
 * 图层基类。请勿自行创建该类实例
 * 
* @param {Object} [options] 配置项
* @param {String} [options.id=GUID] 图层id
* @param {String} [options.name=options.id] 图层名
*/
class Layer {

    _id;
    _name;
    _type;
    _delegate;
    _pickable = false;
    _ignoreByLayerTree;

    /**
     * @type {Map}
     *
     * @memberof Layer
     */
    _map;



    _layerGroup;


    _state;//added/removed/undefined

    _layerEvent;


    _visible = true;//图层显隐



    /**
     * 图层Id
     * @type {String}
     * @readonly
     * @memberof Layer
     */
    get id() {
        return this._id;
    }


    /**
     * 图层名
     *
     * @type {String}
     * @readonly
     * @memberof Layer
     */
    get name() {
        return this._name;
    }


    /**
     * 图层类型
     *
     * @readonly
     * @memberof Layer
     */
    get type() {
        return this._type;
    }


    /**
     * 图层代理
     *
     * @readonly
     * @memberof Layer
     */
    get delegate() {
        return this._delegate;
    }


    /**
     * 所在地图实例
     *
     * @readonly
     * @memberof Layer
     */
    get map() {
        return this._map;
    }


    /**
     * 所在图层组
     *
     * @readonly
     * @memberof Layer
     */
    get layerGroup() {
        return this._layerGroup;
    }


    /**
     * 图层状态
     *
     * @readonly
     * @memberof Layer
     */
    get state() {
        return this._state;
    }


    /**
     * 图层可见性
     *
     * @memberof Layer
     */
    get visible() {
        return this._visible;
    }
    set visible(value) {
        // if (!JSHelper.IsBoolean(value) || value == this._visible)
        if (!JSHelper.IsBoolean(value))
            return;
        this._setVisible(value);
        this._visible = value;
    }


    /**
     * 标识图层要素是否可被拾取
     * @private
     * @memberof Layer
     */
    get pickable() {
        return this._pickable;
    }
    set pickable(value) {
        if (JSHelper.IsBoolean(value)) {
            this._pickable = value;
        }
    }


    /**
     * 图层事件
     * @type {LayerEvent}
     *
     * @readonly
     * @memberof Layer
     */
    get layerEvent() {
        return this._layerEvent;
    }


    /**
    * @param {Object} [options] 配置项
    * @param {String} [options.id=GUID] 图层id
    * @param {String} [options.name=options.id] 图层名
    * @constructor
    */
    constructor(options = {}) {
        this._id = options.id || JSHelper.GenerateGUID();
        this._name = options.name || this._id;
        // this._type = type;
        this._ignoreByLayerTree = options.ignoreByLayerTree;

        this.pickable = options.pickable


        //----事件初始化
        this._layerEvent = new LayerEvent();
        //注册内置事件回调
        this._layerEvent.on(LayerEventType.ADDED, this._onAdded, this);
        this._layerEvent.on(LayerEventType.REMOVED, this._onRemoved, this);
    }

    //#region 虚方法


    /**
     * 清除图层元素
     * @virtual
     *
     * @memberof Layer
     */
    clear() {
        console.warn("method clear should be overwritten in subclass of Layer");
    }

    /**
    * 销毁图层
    *
    * @virtual
    * @memberof Layer
    */
    destroy() {
        console.warn("method destroy should be overwritten in subclass of Layer");
    }


    toJSON() {
        return JSON.stringify({
            type: this.type,
            id: this.id,
            name: this.name,
            ignoreByLayerTree: this._ignoreByLayerTree,
            visible: this.visible,
            pickable: this.pickable,
            isBaseLayer: this.isBaseLayer,
            layerGroupId: this.layerGroup?.id
        })
    }



    /**
     *@virtual
     *
     * @private
     * @param {*} flag
     * @memberof Layer
     */
    _setVisible(flag) {
        console.warn("method _setVisible should be overwritten in subclass of Layer")
    }


    /**
     *
     * @virtual
     * @private
     * @memberof Layer
     */
    _onAdded() {
        console.warn("method _onAdded should be overwritten in subclass of Layer");
    }


    /**
     *
     * @virtual
     * @private
     * @memberof Layer
     */
    _onRemoved() {
        console.warn("method _onRemoved should be overwritten in subclass of Layer");
    }


    _getOverlayers() {
        let overlays = [], overlays2 = [];
        if (this.map._dynamicOverlays.length > 0) {
            overlays = this.map._dynamicOverlays.filter(p => p.attachedLayerID === this.id)
        }
        if (this.map._overlays.length > 0) {
            overlays2 = this.map._overlays.filter(p => p.attachedLayerID === this.id);
        }
        return overlays.concat(overlays2);
    }

    _changeOverlaysVisible(flag) {
        let overlays = this._getOverlayers();
        let element;
        for (let i = 0; i < overlays.length; i++) {
            element = overlays[i];
            element._open = flag;
            if (!element.location)
                continue;
            element.visible = element._open & (this.map.sceneMode == 3 ? this.map._cache.ellipsoidalOccluder.isPointVisible(element.location) : true);
            if (element.visible)
                element._render();
        }
    }

    //#endregion

}


function queueLayer(layer) {
    // let index;
    // if (layer._isBaseLayer)
    //     layer._priority = 0;
    // const threshold = layer._priority + 1;
    // index = layer._map.viewer.imageryLayers._layers.filter(p => p._uPriority < threshold).length;
    // // if (index === -1)
    // // index = undefined;
    // layer._map.viewer.imageryLayers.add(layer._delegate, index);
    // layer._delegate._uPriority = layer._priority;
}



export { Layer, queueLayer };