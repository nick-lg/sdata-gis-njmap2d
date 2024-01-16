import { message } from "antd";
import { JSHelper } from "../../../libs/JSHelper.js";
import { EnumState, LayerType } from "../base/Constants.js";
import { NotifySizeChangedArray } from "../base/NotifySizeChangedArray.js";
import { MapEventType } from "../event/EventType.js";
import { Layer } from "./Layer.js";


/**
 * @summary 图层组
 *
 * @extends {Layer}
 */
class LayerGroup extends Layer {
    _layers;


    /**
     * 从属该图层组的图层列表
     *
     * @readonly
     * @memberof LayerGroup
     */
    get layers() {
        return [...this._layers];
    }


    /**
     * 图层组可见性
     *
     * @memberof LayerGroup
     */
    get visible() {
        if (this._layers.length == 0)
            return this._visible;
        else if (this._layers.length == 1)
            return this._layers[0].visible;
        else {
            this._visible = false;
            for (let i = 0; i < this._layers.length; i++) {
                if (this._layers[i].visible) {
                    this._visible = true;
                    break;
                }
            }
            return this._visible;
        }
    }
    set visible(value) {
        if (!JSHelper.IsBoolean(value))
            return;
        this._setVisible(value);
        this._visible = value;
    }






    /**
    * @param {Object} [options={}] 配置项
    * @param {String} [options.id=GUID] 图层id
    * @param {String} [options.name=options.id] 图层名
    * @param {Array.<Layer>} [options.layers=[]] 子图层数组
    * @constructor
    */
    constructor(options = {}) {
        super(options);
        this._type = LayerType.LAYER_GROUP;

        if (JSHelper.IsArray(options.layers) && options.layers.length > 0) {
            if (options.layers.length == 1)
                this._layers = new NotifySizeChangedArray(options.layers[0]);
            else
                this._layers = new NotifySizeChangedArray(...options.layers);
        }
        else
            this._layers = new NotifySizeChangedArray();

        this._layers.addHandler((obj) => {
            let isAddOption = ["push", "unshift"].indexOf(obj.type) > -1 ? true : false;
            let layers = obj.data;
            let index;

            if (this._state == EnumState.ADDED) {
                layers.forEach(layer => {
                    if (isAddOption) {
                        if (this.map._cache.layerIds.has(layer.id)) {
                            message.warn(`add layer failed: layerID ${layer.id} is already exists`, 4.5);
                            index = this._layers.findIndex(value => { return value === layer });
                            if (index > -1) {
                                layer._preventDefault = true;//标记不触发移除事件
                                this._layers.splice(index, 1);
                            }
                        }
                        else {
                            layer._layerGroup = this;
                            this._map.mapEvent.emit(MapEventType.LAYER_ADDED, layer);
                        }
                    }
                    else {
                        layer._layerGroup = undefined;
                        layer._isBaseLayer = undefined;
                        if (layer._preventDefault)
                            delete layer["_preventDefault"];
                        else
                            this._map.mapEvent.emit(MapEventType.LAYER_REMOVED, layer);
                    }
                });
            }
        })
    }


    /**
     * 获取指定id的图层节点
     *
     * @param {String} id 
     * @return {Layer|LayerGorup} 
     * @memberof LayerGroup
     */
    getLayerById(id) {
        if (!JSHelper.IsString(id))
            return;

        let layerNode;
        for (let i = 0; i < this._layers.length; i++) {
            if (this._layers[i].id == id)
                return this._layers[i];


            if (this._layers[i]._type == LayerType.LAYER_GROUP) {
                layerNode = this._layers[i].getLayerById(id);
                if (layerNode)
                    return layerNode;
            }
        }
        return layerNode;
    }


    /**
     * 获取指定名称的所有图层节点
     *
     * @param {String} name 图层名称
     * @return {Array.<Layer>} 
     * @memberof LayerGroup
     */
    getLayersByName(name) {
        let layers = [];
        if (JSHelper.IsString(name)) {
            for (let i = 0; i < this._layers.length; i++) {
                const element = this._layers[i];
                if (element.name === name)
                    layers.push(element);
                else if (element.getLayersByName)
                    layers.push(...element.getLayersByName(name));
            }
        }
        return layers;
    }




    /**
     * 添加图层至图层组
     *
     * @param {Layer} layer
     * @return {Boolean} 
     * @memberof LayerGroup
     */
    addLayer(layer) {
        if (layer instanceof Layer) {
            this._layers.push(layer);
            return true;
        }
        return false;
    }

    /**
     * 从图层组移除指定图层(遍历图层树)
     *
     * @param {Layer} layer
     * @return {Boolean} 
     * @memberof LayerGroup
     */
    removeLayer(layer) {
        if (!(layer instanceof Layer))
            return false;

        let removed = false;
        for (let i = 0; i < this._layers.length; i++) {
            if (layer.id === this._layers[i].id) {
                this._layers.splice(i, 1);
                return true;
            }

            if (this._layers[i]._type == LayerType.LAYER_GROUP) {
                removed = this._layers[i].removeLayer(layer);
                if (removed)
                    return true;
            }
        }
        return false;
    }


    /**
     * 根据图层id从图层组移除图层(遍历图层树)
     *
     * @param {String} id
     * @return {Boolean} 
     * @memberof LayerGroup
     */
    removeLayerById(id) {
        let layer = this.getLayerById(id);
        if (layer instanceof Layer) {
            return this.removeLayer(layer);
        }
        return false;
    }

    /**
     * 移除所有图层(遍历图层树)
     *
     * @memberof LayerGroup
     */
    clear() {
        this._layers.splice(0, this._layers.length);
    }


    /**
     * 遍历图层节点执行方法
     *
     * @param {*} func 入参为图层节点的迭代函数
     * @param {*} skipLayerGroupNode 是否跳过图层组节点本身
     * @param {*} context this上下文
     * @ignore
     * @memberof LayerGroup
     */
    eachLayer(func, skipLayerGroupNode, context) {
        let layer;
        for (let i = 0; i < this.layers.length; i++) {
            layer = this.layers[i];
            if (layer.type == LayerType.LAYER_GROUP) {
                if (!skipLayerGroupNode)
                    func.call(context, layer);

                layer.eachLayer(func, skipLayerGroupNode, context);

                // for (let j = 0; j < layer.layers.length; j++) {
                //     const element = layer.layers[j];
                //     if (element.type == LayerType.LAYER_GROUP)
                //         element.eachLayer(func, skipLayerGroupNode, context);
                //     else
                //         func.call(context, element);
                // }
            }
            else
                func.call(context, layer);
        }
    }

    destroy() {
    }


    toJSON() {
        return JSON.stringify({
            type: this.type,
            id: this.id,
            layerGroupId: this.layerGroup?.id,
            name: this.name,
            ignoreByLayerTree: this._ignoreByLayerTree,
            visible: this.visible,
            pickable: this.pickable,
            layers: this.layers
        })
    }


    _onAdded(map) {
        this._map = map;
        this.layers.forEach(layer => {
            layer._layerGroup = this;
            map.mapEvent.emit(MapEventType.LAYER_ADDED, layer);
        }, this)
        this._state = EnumState.ADDED;
    }
    _onRemoved() {
        this._layers.splice(0, this._layers.length);

        //状态更新
        this._map = undefined;
        this._state = EnumState.REMOVED;
    }

    _setVisible(value) {
        this._layers.forEach((layerNode) => {
            layerNode.visible = value;
        })
        this._visible = value;
    }

}

export { LayerGroup }