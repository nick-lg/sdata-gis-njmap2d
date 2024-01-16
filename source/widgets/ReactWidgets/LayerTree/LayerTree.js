import React from "react"
import { Tree } from "antd"
import { Map } from "../../../core/map/Map.js";

import { MapEventType } from "../../../core/event/EventType.js";
import "./LayerTree.css"
import { LayerType } from "../../../core/base/Constants.js";
import { JSHelper } from "../../../../libs/JSHelper.js";


/**
 * @summary 图层树组件。默认显示在地图右上角。
 *
 * @extends {React.Component}
 */
class LayerTree extends React.Component {


    /**
    *@type {Map}
   *
   * @readonly
   * @memberof Widget
   */
    get map() {
        return this.props.map;
    }


    /**
     *
     * @param {Object} options
     * @param {Map} options.map 关联地图实例
     * @param {String|HTMLElement} options.container 组件容器or容器id
     * @param {String} [options.className] 组件css类名
     * 
     */
    constructor(props) {
        super(props);
        let layers = [];
        let checkedLayerIds = [];
        this.map.layers.forEach(element => {
            this.#parseLayer(element, layers, checkedLayerIds);
        });
        this.state = {
            layers: layers,
            checkedLayerIds: checkedLayerIds
        }

        this.map.mapEvent.on(MapEventType.LAYER_ADDED, this.#onLayerAdded, this);
        this.map.mapEvent.on(MapEventType.LAYER_REMOVED, this.#onLayerRemoved, this);
    }


    #parseLayer(layer, layerNodes, checkedLayerIds) {
        if (layer._ignoreByLayerTree)
            return


        layerNodes = JSHelper.IsArray(layerNodes) ? layerNodes : [];
        checkedLayerIds = JSHelper.IsArray(checkedLayerIds) ? checkedLayerIds : [];
        if (layer._type == LayerType.LAYER_GROUP) {
            let children = [];
            layerNodes.push(
                {
                    key: layer.id,
                    title: layer.name,
                    checkable: true,
                    children: children
                }
            )
            layer._layers.forEach(item => {
                this.#parseLayer(item, children, checkedLayerIds);
            })
        }
        else {
            layerNodes.push(
                {
                    key: layer.id,
                    title: layer.name,
                    checkable: true,
                }
            )
            if (layer.visible)
                checkedLayerIds.push(layer.id);
        }
        // return {
        //     layerNodes: layerNodes,
        //     checkedLayerIds: checkedLayerIds
        // }
    }


    #onLayerAdded(layer) {
        let layers = [];
        let checkedLayerIds = [];
        this.map.layers.forEach(element => {
            this.#parseLayer(element, layers, checkedLayerIds);
        });
        this.setState({ layers: layers });
        this.setState({ checkedLayerIds: checkedLayerIds })

        this.props.container.style.display = layers.length > 0 ? "" : "none";
    }

    #onLayerRemoved(layer) {
        let layers = [];
        let checkedLayerIds = [];
        this.map.layers.forEach(element => {
            this.#parseLayer(element, layers, checkedLayerIds);
        });
        this.setState({ checkedLayerIds: checkedLayerIds })
        this.setState({ layers: layers });

        this.props.container.style.display = layers.length > 0 ? "" : "none";
    }

    #onLayerChecked(checkedKeys, e) {
        // checkedKeys, e:{checked: bool, checkedNodes, node, event, halfCheckedKeys}
        let layer = this.map.getLayerById(e.node.key);
        if (layer)
            layer.visible = e.checked;

        this.setState({ checkedLayerIds: checkedKeys })
    }

    componentDidMount() {
        this.props.container.style.display = this.map.layers.filter(v => {
            return !v._ignoreByLayerTree
        }).length > 0 ? "" : "none";
    }


    // componentDidUpdate() {
    //     console.info("componentDidUpdated")
    // }

    // componentWillUnmount()
    // {
    //     console.info("componentWillUnmount")
    // }

    render() {
        // console.info("render")
        return <Tree treeData={this.state.layers}
            checkable checkedKeys={this.state.checkedLayerIds}
            onCheck={this.#onLayerChecked.bind(this)}
            rootClassName={this.props.className || "sdg-widget-layerTree"}>
        </Tree>
    }


    __onAdded(map) {
        this.props.container.style.display = map.layers.filter(v => {
            return !v._ignoreByLayerTree
        }).length > 0 ? "" : "none";
    }
}
export { LayerTree }


