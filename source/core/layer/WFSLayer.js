import { JSHelper } from "../../../libs/JSHelper.js";
import { LayerType, EnumState, TargetType } from "../base/Constants.js";
import { Layer } from "./Layer.js";


/**
 * 
 * 
 * @param {Object} options
 * @param {String} options.url 链接
 * @param {Interger} [options.lodMinLevel=2] LOD最小层级
 * @param {Interger} [options.lodMaxLevel=20] LOD最大层级
 * @param {Object} [options.style] 样式
 * @param {Object} [options.filter={}] 过滤条件
 *
 * @class WFSLayer
 * @extends {Layer}
 */
class WFSLayer extends Layer {
    #url;
    #options;
    #tickID

    get url() {
        return this.#url;
    }


    /**
     * Creates an instance of WFSLayer.
     * @param {*} options
     * @memberof WFSLayer
     */
    constructor(options) {
        super(options)

        this.#url = options.url;
        this._type = LayerType.WFS_LAYER;
        // this.#correct = options.correct;

        this.#options = options;


        this._priority = [0, 1].indexOf(options.priority) > -1 ? options.priority : 2;

        // const levels = [
        //     JSHelper.IsInteger(options.lodMinLevel) ? options.lodMinLevel : 2,
        //     JSHelper.IsInteger(options.lodMaxLevel) ? options.lodMaxLevel : 20,
        // ]

        // debugger
        // const pattern = /^(https?:\/\/)?([\w.-]+\.[a-zA-Z]{2,})(\/[\w.-]*)*\/?$/;
        // if (pattern.test(options.url) || options.url.indexOf("localhost") > -1 || options.url.indexOf("127.0.0.1") > -1 || options.url.indexOf(":") > -1) {
        //     this._delegate = {
        //         id: this.id,
        //         type: "raster",
        //         source: {
        //             scheme: this.#tileType == "normal" ? "xyz" : "tms",   // p.isTMS ? "tms" : "xyz",
        //             type: "raster",
        //             tiles: [this.url],//https://wprd04.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7
        //             tileSize: 256
        //         },
        //         minzoom: levels[0],
        //         maxzoom: levels[1]
        //     };
        // }
        // else {
        //     this._isNJLayer = true;
        //     this._delegate = new GeoGlobe.NJLayer(this.#url);
        // }



        this._delegate = {};
        this._state = EnumState.INITIALIZED;
    }


    /**
  * 拾取要素
  * 
  * @param {Object} wp 窗口坐标,形如 {x:95,y:27}
 //  * @param {*} options
  * @return {Promise|undefined} 
  * @memberof WMSLayer
  */
    pickFeatures(wp, options) {
        if (!this.pickable || !wp || typeof wp != "object")
            return;



        // let position;
        // position = CesiumHelper.WindowToWGS84(this.map.viewer, new Cesium.Cartesian2(wp.x, wp.y));
        // if (!position)
        //     return;

        // position = Cesium.Cartographic.fromCartesian(position);


        // let cartesian = this._delegate.imageryProvider.tilingScheme.positionToTileXY(position, this.map.level);
        // const self = this;
        // return this._delegate.imageryProvider.pickFeatures(cartesian.x, cartesian.y, this.map.level, position.longitude, position.latitude).then(features => {
        //     const got = features.length > 0;
        //     if (got)
        //         return {
        //             delegate: features,
        //             layer: self,
        //             type: TargetType.IMAGERY_LAYER_FEATURE_INFO
        //         }
        //     else
        //         return undefined
        // }).catch(reason => {
        //     console.error(`pick feature failed:${reason}`);
        // });

        const self = this;
        let features;
        if (this._delegate.layerType == "VTS") {
            //VTS图层
            features = this._map._viewer.queryRenderedFeatures(new mapboxgl.Point(wp.x, wp.y)).filter(p => p.layer?.metadata?.userdata?.id == this.id);
        }
        else {
            //普通WFS
            features = this._map._viewer.queryRenderedFeatures(new mapboxgl.Point(wp.x, wp.y)).filter(p => p.layer.id == this._delegate.id);
        }


        // let features = this._map._viewer.queryRenderedFeatures(new mapboxgl.Point(1000, 500));

        if (features.length == 0)
            return undefined;
        else {
            //适配基线解析方法：<
            features.forEach(element => {
                element.data = {
                    geometry: element.geometry,
                    properties: element.properties
                }
            });
            return {
                delegate: features,
                layer: self,
                type: TargetType.FEATURE
            }
        }
    }


    _onAdded(map) {
        this._map = map;
        //     // var dt_layer = new GeoGlobe.NJLayer("esri_vec_dt_public");
        //     // map.loadSprite(dt_layer.sprite);
        //     // map.style.setGlyphs(dt_layer.glyphs);

        // if (this._delegate.sprite)
        //     this._map.viewer.loadSprite(this._delegate.sprite);
        // if (this._delegate.glyphs)
        //     this._map.viewer.setGlyphs(this._delegate.glyphs);

        const selfaaa = this;
        const options = selfaaa.#options;
        const levels = [
            JSHelper.IsInteger(options.lodMinLevel) ? options.lodMinLevel : (JSHelper.IsInteger(options.minzoom) ? options.minzoom : 0),
            JSHelper.IsInteger(options.lodMaxLevel) ? options.lodMaxLevel : (JSHelper.IsInteger(options.maxzoom) ? options.maxzoom : 22),
        ]

        if (options.type == "fill-extrusion") {
            var VTS = new GeoGlobe.Format.VTS();
            const layer = selfaaa.#options.layer
            if (!layer) {
                throw new Error(`创建建筑类型图层，需要指定layer属性`);
            }
            var ltfw_layer = VTS.createLayer(selfaaa.#url, {
                layer: layer,
            });

            const style = options.style || paint;
            ltfw_layer.layers.forEach(pLayer => {
                Object.keys(style).forEach(key => {
                    pLayer.paint[key] = style[key];
                })
                // map.viewer.setLayerZoomRange(pLayer.id, levels[0], levels[1])
                // map.viewer.setLayoutProperty(pLayer.id, "minzoom", levels[0]);
                // map.viewer.setLayoutProperty(pLayer.id, "maxzoom", levels[0]);
                pLayer.metadata.userdata = {
                    id: this.id
                }
            })

            this._delegate = ltfw_layer;
            this._delegate.layers[0].metadata.userdata = {
                id: this.id
            }

            const _id = `${layer}_0_0`;
            this.#tickID = setInterval(() => {
                // JBXQ_LTFW
                // JBXQ_LTFW_0_0
                let layers = map.viewer.getStyle().layers.filter(p => p.id == _id);
                if (layers.length > 0) {
                    clearInterval(selfaaa.#tickID);
                    selfaaa.#tickID = undefined;
                    map.viewer.setLayerZoomRange(_id, levels[0], levels[1]);
                }
            }, 200)

            map.viewer.addLayer(ltfw_layer);

            //状态更新
            this._state = EnumState.ADDED;

            //更新可见性
            this.visible = this._visible;
        }
        else {
            fetch(this.#url).then(res => res.json()).then(data => {
                // const p = data.features[0].geometry
                // if (!p) {
                //     console.warn(`empty layer data`);
                //     return;
                // }

                // let type;
                // switch (p.geometry.type) {
                //     case "Point":
                //     case "MultiPoint":
                //         type = "Point"
                //         break;
                //     case "LineString":
                //     case "MultiPoint":
                //         break;

                //     default:
                //         break;
                // }




                selfaaa.map._viewer.addSource(selfaaa.id, {
                    type: "geojson",
                    data: data
                })


                selfaaa._delegate = {
                    id: selfaaa.id,
                    source: selfaaa.id,
                    type: options.type,
                    paint: options.style || options.paint,
                    minzoom: levels[0],
                    maxzoom: levels[1],
                }

                if (options.filter)
                    selfaaa._delegate.filter = options.filter


                if (this._isBaseLayer)
                    this._map.viewer.addLayerToGroup(this.delegate, "basemap");
                else
                    this._map.viewer.addLayer(this.delegate);


                // let index = this._isBaseLayer ? this._map.baseLayers.length - 1 : undefined;//for this time layer has been added to layers
                // this._map.viewer.imageryLayers.add(this._delegate, index);

                // let index = (this._isBaseLayer || this._priority === 0) ? this._map.baseLayers.length - 1 : undefined;//for this time layer has been added to layers
                // if (typeof index === "undefined") {
                //     index = this._map.viewer.imageryLayers._layers.filter(p => p._uPriority < 2).length - 1;
                // }
                // this._map.viewer.imageryLayers.add(this._delegate, index);
                // this._delegate._uPriority = this._isBaseLayer ? 0 : this._priority;
                // queueLayer(this);

                //状态更新
                this._state = EnumState.ADDED;

                //更新可见性
                this.visible = this._visible;


            }).catch(err => {
                console.error(`request wfs data failed:${err}`);
            })
        }
    }

    _onRemoved(map) {
        //真正移除影像图的指令
        // if (this.delegate.id)
        if (this.delegate.layerType == "VTS") {
            if (this.#tickID) {
                clearInterval(this.#tickID);
                this.#tickID = undefined;
            }


            this.delegate?.layers.forEach(p => {
                map.viewer.removeLayer(p.id)
            })
            map.viewer.removeSource(this.delegate.source_id)
        }
        else {
            if (this.delegate?.id)
                map.viewer.removeLayerAndSource(this.delegate.id);
        }


        //状态更新
        this._map = undefined;
        this._state = EnumState.REMOVED;
    }

    _setVisible(flag) {
        if (this._state != EnumState.ADDED)
            return;

        const method = flag ? "showLayer" : "hideLayer";
        const that = this;
        if (this._delegate.layerType == "VTS") {
            this._delegate.layers.forEach(p => {
                that.map.viewer[method](p.id)
            })
        }
        else {
            this._map.viewer[method](this._isNJLayer ? this._delegate.id : this._id);
        }
        this._visible = flag;
    }
}
export { WFSLayer }