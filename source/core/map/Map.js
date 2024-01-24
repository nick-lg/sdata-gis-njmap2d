import "../../widgets/widget.css"
import { LayerType, PreDefinedExtent } from "../base/Constants.js";
import { DrawEventType, LayerEventType, MapEventType, MouseEventType } from "../event/EventType.js";
import { MapEvent } from "../event/MapEvent.js";
import { MouseEvent } from "../event/MouseEvent.js";

import { ImageryLayer } from "../layer/ImageryLayer.js";
import { Layer } from "../layer/Layer.js";


import { message } from "antd";
// import { CesiumHelper } from "../../../libs/CesiumHelper.js";
import { JSHelper } from "../../../libs/JSHelper.js";
// import { Interaction } from "../../interactions/Interaction.js";
// import { Popup } from "../../overlay/Popup.js";
// import { WidgetManager } from "../../widgets/WidgetManager.js";
import { NotifySizeChangedArray } from "../base/NotifySizeChangedArray.js";
// import { ImageryLayerFactory } from "../layer/ImageryLayerFactory.js";
import { LayerGroup } from "../layer/LayerGroup.js";
import { ViewPoint } from "./ViewPoint.js";
import { LayerFactory } from "../layer/LayerFactory.js";




/**
     * 
     * Map类包含用于渲染、管理覆盖2/2.5/3D模式场景的属性、方法和事件。 
     * 
     * @param {HTMLElement|String} mapContainer 地图容器(dom element or id 均可)
     * @param {Object} options 配置项
     * @param {String|Object|Array<String|Object>} [options.baseMap="gaode-street"] 底图配置。默认使用高德街道图。更多参数配置参见{@link Map.setBaseMap}
     * @param {Object} [options.widgets={zoom_button:true,home_button:true,attribution:true,scene_mode_picker:true}] 底图组件配置。默认加载缩放按钮、主视图、版权组件、场景切换器
     * @param {Integer} [options.sceneMode=3] 底图模式。可选值：3(3D),2(2D),1(2.5D) 
     * @param {Integer} [options.minLevel=2] 最小缩放级别
     * @param {Integer} [options.maxLevel=20] 最大缩放级别
     * @param {Array<Number>} [options.homeViewExtent=[73.55, 3.85, 135.09, 53.55]] 主视图范围。默认为中国地理范围
     * @param {ViewPoint} [options.homeViewPoint] 主视点。当主视点存在时，忽略主视图范围和地图中心点。
     * @param {Array.<Number>} [options.center] 主视图地图中心点。当地图中心点存在时，忽略主视点和地图范围。
     * @param {Integer} [options.level] 主视图缩放级别。当且地图中心点存在时有效。注意：全模式下层级和视点高度无法精确换算，故模式切换相关逻辑准确度不能保证，慎用:<
     * @param {String} [options.projection="4326"] 地图投影，可选值："4326","3857",
     * @param {Number} [options.clockMode=0] 时钟模式
     * @param {String|Object} [options.terrain="no"] 地形配置。默认无地形。更多参数配置，参见{@link Map.setTerrain}
     * @param {String} [options.offlineAssetsPath] 离线资源路径。内网示例： "http://10.15.111.14:43216/geodata"
     * @param {String} [options.pluginPath] 插件路径
     * 
     * 
     * 
     */
class Map {
    _viewer;
    _camera;
    _scene;
    _isRequestRenderMode;
    _debugger;//全局调试开关
    _baseMap;
    _baseMapID;
    #homeViewPoint;

    #ui;

    _mapEvent;
    _mouseEvent;
    _layers = new NotifySizeChangedArray();//地图承载的所有图层

    _highlightedConfig;
    _selections = [];

    _interactions = {
        drawTool: undefined,
        measureTool: undefined,
    }
    _popup;
    _menu;

    _overlays = [];
    _dynamicOverlays = [];

    #offlineAssetsPath;
    #pluginPath;

    //内部+临时变量
    _cache = {

        sceneMode: undefined,


        layerIds: new Set(),
        minLevel: -1,
        maxLevel: 25,//cesium 最大瓦片级数
        preLevel: undefined,//上一层级
        preExtent: undefined,//上一视图
        preViewPoint: undefined,//上一视点
        viewPoint: new ViewPoint([0, 0, 0], 0, 0, 0),
        viewPointBeforSceneModeChanging: new ViewPoint([0, 0, 0], 0, 0, 0),//记录模式更改前的视点信息
        restrictedViewExtent: undefined,//限定地图范围(仅对2D有效)
        realRestrictedViewExtentComputed: false,//标识真正的限定视图范围是否已计算
        stopViewPoint: undefined,// 2D范围限定前的有效视点,
        isRestorePreView: false,//是否正在恢复以前视图(模式切换时开启)

        viewLoaded: false,//标识视图是否加载完毕(初次到达视点)
        // cartesian2: new Cesium.Cartesian2(),
        // cartesian3: new Cesium.Cartesian3(),
        // cartographic: new Cesium.Cartographic(),
        // rectangle: new Cesium.Rectangle(),

        isInPitchOperation: false,//标识是否正在操作相机倾角
        dynamicMinCameraHeight: undefined,//2.5/3D相机最低高度
        dynamicMinCameraHeight2D: undefined,//2D相机最低高度
        maxPitch: 10,//相机最大倾角限定
        cameraPercentageChanged: 0.01,//相机更改事件触发阈值
        updatePopupsFun: undefined,
        ellipsoidalOccluder: undefined,

        playbackTargetIds: [],
        // timeline:false,
        // animation:false,
        graphicsDatasource: undefined,//默认自定义数据源
        rotationAnimationID: undefined,//旋转动画id

        removeCallback_tracking: undefined,//跟踪移除句柄
        removeCallback_timeReached: undefined,

        chunks: [],
        editor: undefined,
        terrain: undefined,//地形配置

        backTimeRange: undefined,
        backClockRange: undefined,
        backCurrentTime: undefined,
        removeCallback_timeReached: undefined,
    }


    // #cesiumHelper;

    /**
     * Cesium Viewer实例
     * @type {Cesium.Viewer}
     *
     * @readonly
     * @memberof Map
     */
    get viewer() {
        return this._viewer;
    }


    /**
     * 地图容器
     * 
     * @type {HTMLElement}
     *
     * @readonly
     * @memberof Map
     */
    get container() {
        return this.viewer._container;
    }


    /**
     * 底图
     *
     * @readonly
     * @memberof Map
     */
    get baseMap() {
        return this._baseMap;
    }


    get level() {
        return this.viewer.getZoom();
    }

    get minLevel() {
        return this._cache.minLevel;
    }
    get maxLevel() {
        return this._cache.maxLevel;
    }


    /**
     * 当前场景模式
     *
     * @type {Integer}
     * @memberof Map
     */
    get sceneMode() {
        // return this._viewer.scene.mode;
        return this._cache.sceneMode;
    }
    set sceneMode(value) {
        value = +value;
        switch (value) {
            case 1:
            case 3:
                this.viewer.setPitch(45);
                this.viewer.dragRotate.enable()
                break;
            case 2:
                this.viewer.dragRotate.disable()
                this.viewer.setBearing(0);
                this.viewer.setPitch(0);
                break;
            default:
                break;
        }
    }



    /**
     * 默认视点(默认视点优先级高于默认视图)
     *
     * @memberof Map
     */
    get homeViewPoint() {
        return this.#homeViewPoint;
    }
    set homeViewPoint(value) {
        if (value instanceof ViewPoint || value.position) {
            this.#homeViewPoint = value;
        }
    }

    /**
     * 当前视点
     *
     * @readonly
     * @memberof Map
     */
    get viewPoint() {
        const center = this.viewer.getCenter();
        if (!center)
            return


        this._cache.viewPoint.position[0] = center.lng;
        this._cache.viewPoint.position[1] = center.lat;
        this._cache.viewPoint.position[2] = this.viewer.getZoom();

        this._cache.viewPoint.heading = this.viewer.getBearing();
        this._cache.viewPoint.pitch = this.viewer.getPitch();
        this._cache.viewPoint.roll = 0

        return this._cache.viewPoint;
    }

    /**
     * 当前近似视图范围
     *
     * @memberof Map
     */
    get extent() {
        const extent = this.viewer.getBounds();
        if (!extent)
            return

        return [extent._sw.lng, extent._sw.lat, extent._ne.lng, extent._ne.lat]
    }

    set extent(value) {
        this.viewer.setMaxBounds([[value[0], value[1]], [value[2], value[3]]])
    }



    /**
    * 获取地图中心点坐标
    *
    * @return {Array.<Number>|undefined} 
    * @memberof Map
    */
    get center() {
        const center = this.viewer.getCenter();
        if (!center)
            return;
        return [center.lng, center.lat]
    }





    /**
     * 离线图源路径
     *
     * @readonly
     * @memberof Map
     */
    get offlineAssetsPath() {
        return this.#offlineAssetsPath;
    }


    /**
     * 获取第一级图层节点列表
     *
     * @readonly
     * @memberof Map
     */
    get layers() {
        return this._layers;
    }


    /**
     * 获取所有图层节点列表(不含图层组节点)
     *
     * @readonly
     * @memberof Map
     */
    get realLayers() {
        const iterator = (layer, realLayers) => {
            if (layer instanceof LayerGroup) {
                layer.layers.forEach(item => {
                    iterator(item, realLayers);
                })
            }
            else {
                realLayers.push(layer);
            }
        }

        let realLayers = [];
        this._layers.forEach(layer => {
            iterator(layer, realLayers)
        })
        return realLayers;
    }



    get baseLayers() {
        return this._baseMap.layers.filter(layer => {
            return layer._isBaseLayer == true;
        })
    }





    /**
     * 弹窗
     *
     * @readonly
     * @memberof Map
     */
    get popup() {
        return this._popup;
    }



    /**
     * 要素选择集(选择集中地物将尝试进行高亮处理)
     *
     * @readonly
     * @memberof Map
     */
    get selections() {
        return [...this._selections];
    }


    /**
     * 默认Graphics
     * 
     * @type {Cesium.EntityCollection}
     *
     * @readonly
     * @memberof Map
     */
    get graphics() {
        return this._cache.graphicsDatasource.entities;
    }


    /**
     * 绘制工具
     *
     * @readonly
     * @memberof Map
     */
    get drawTool() {
        return this._interactions.drawTool;
    }


    /**
     * 量测工具
     *
     * @readonly
     * @memberof Map
     */
    get measureTool() {
        return this._interactions.measureTool;
    }



    /**
     * 地图事件
     * 
     * @type {MapEvent}
     *
     * @readonly
     * @memberof Map
     */
    get mapEvent() {
        return this._mapEvent;
    }


    /**
     * 鼠标事件
     * 
     * @type {MouseEvent}
     * @readonly
     * @memberof Map
     */
    get mouseEvent() {
        return this._mouseEvent;
    }


    constructor(mapContainer, options = {}) {
        this.#initDelegate(mapContainer, options);

        return


        //初始化事件
        this.#initEvents();

        //设置底图
        this.#offlineAssetsPath = options.offlineAssetsPath;//离线影像图路径
        this.#pluginPath = options.pluginPath;//插件路径
        window.SDG_OFFLINE_ASSETS_PATH = this.#offlineAssetsPath;
        window.SDG_PLUGIN_PATH = this.#pluginPath;
        const baseMapOptions = options.baseMap || [
            {
                type: "gaode-street",
                correct: false,
            }
        ];
        this.setBaseMap(baseMapOptions);

        //Widgets
        const widgetConfig = {
            zoom_button: true,
            home_button: true,
            attribution: true,
            scene_mode_picker: true,
            menu: true,
        }
        Object.assign(widgetConfig, options.widgets)
        //create timeline and animation even if the config is false.flase just affect the visible
        widgetConfig.timeline = true;
        widgetConfig.animation = true;
        this.#initWidgets(widgetConfig);

        this.ui.getWidgetByName("timeline").visible = options.widgets?.timeline;//配置项仅影响其显隐
        this.ui.getWidgetByName("animation").visible = options.widgets?.animation;


        //地形
        this.setTerrain(options.terrain);


        //popup
        this._popup = new Popup({
            horizontalOrigin: "left",
            verticalOrigin: "bottom",
            closeBtn: true,
            destroryAfterClose: false
        });
        this.addOverlay(this._popup);

        //默认graphics
        this._cache.graphicsDatasource = new Cesium.CustomDataSource('sdata-gis-graphics-datasource');
        this._viewer.dataSources.add(this._cache.graphicsDatasource);


        //飞至主视图
        this.flyHome(2, () => {
            this._cache.preLevel = this.level;
            this._cache.preExtent = this.extent;
            this._cache.preViewPoint = JSHelper.DeepClone(this.viewPoint);
            this._cache.viewLoaded = true;

            //触发地图视图初次加载完毕事件
            if (this.mapEvent._events[MapEventType.VIEW_LOADED]._listeners.length > 0)
                this.mapEvent.emit(MapEventType.VIEW_LOADED, this);
        });
    }

    /**
     * 设置底图
     *
     * @param {String|Object|Array<Object>} baseMapOptions 底图配置项(可一次配置多个底图图层)
     * @return {Array<Layer|LayerGroup>} 当前底图图层数组
     * @memberof Map
     * 
     * 
     * @example 
     * 
     * 在线地图资源:
     * "gaode-imagery"
     * "gaode-street"
     * "baidu-imagery"
     * "baidu-street"
     * "tencent-dark"
     * "tdt-imagery" (不稳定,慎用) 
     * "arcgis-imagery"
     * "arcgis-street-purplishBlue"
     * "superMap-zxyTileImage-world"
     * "none" (空白底图)
     * 
     * 离线地图资源(注意：使用离线地图,需要在创建地图实例时传入离线资源根路径参数offlineAssetsPath，参见Map构造器参数列表)：
     * "gaode-imagery-offline"
     * "gaode-street-offline"
     * "baidu-street-offline"
     * "baidu-dark-offline"(百度炫黑)
     * "tencent-dark-offline"(腾讯炫黑)
     * "arcgis-imagery-offline"
     * 
     * 
     * 使用关键字加载地图
     * baseMapOptions="gaode-street"
     * 
     * 启用互联网底图纠偏选项。
     * baseMapOptions={
     *      type:"gaode-street",
     *      correct:true
     * }
     * 
     * 设置WMS
     * baseMapOptions={
     *      type:"wms",
     *      url:"http://10.15.111.14:58888/geoserver/NJSDATA_TEST/wms?service=WMS&version=1.1.0&request=GetMap&layers=NJSDATA_TEST%3AL06&bbox=-2.003750834278924E7%2C-2.003750834278921E7%2C2.0037508342789248E7%2C2.0037508342789277E7&width=768&height=768&srs=EPSG%3A3857&styles=&format=image%2Fpng"
     * }
     * 
     * 设置TMS
     * baseMapOptions={
     *      type: "tms",
     *      url: "http://localhost:8099/geodata/imageryTiles/TMS-JLH-18?format=image/png",
     * }
     * 
     * 设置WMTS
     * baseMapOptions={
     *      type: "wmts",
     *      url: "http://10.15.111.14:58888/geoserver/gwc/service/wmts/rest/NJSDATA_TEST:L10/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}?format=image/png",
     *      layer:"NJSDATA_TEST:L10",
     *      tileMatrixSetID: "NJSdata-3857", 
     *      style:"",
     *      format:"image/png"
     * }
     * 
     * 设置多个底图图层
     * baseMapOptions=[
     *      "gaode-imagery",
     *      {
     *          type:"wms",
     *          url: "http://10.15.111.14:58888/geoserver/gwc/service/wmts/rest/NJSDATA_TEST:L10/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}?format=image/png",
     *          tileMatrixSetID: "NJSdata-3857",    
     *      }
     * ]
     * 
     * 
     */
    async setBaseMap(baseMapOptions) {
        if (JSHelper.IsString(baseMapOptions)) {
            baseMapOptions = [{
                type: baseMapOptions
            }];
        }

        if (JSHelper.IsObject(baseMapOptions)) {
            baseMapOptions = [baseMapOptions];
        }

        if (!JSHelper.IsArray(baseMapOptions) || baseMapOptions.length == 0)
            return [];

        if (!this._baseMap) {
            this._baseMap = new LayerGroup({
                name: "底图",
                ignoreByLayerTree: true,
            });
            this.addLayer(this._baseMap);
        }
        //清空现有底图
        this._baseMap.clear();
        this._viewer.clearGroup("basemap")




        // //清空现有底图
        // const baseLayerCount = this.baseLayers.length
        // if (baseLayerCount > 0) {
        //     let index;
        //     for (let i = baseLayerCount - 1; i >= 0; i--) {
        //         index = this._layers.findIndex(value => {
        //             return value === this.baseLayers[i];
        //         })
        //         this._layers.splice(index, 1);
        //     }
        // }

        // debugger
        //添加新的底图(底图即为若干imageryLayer)
        let options;

        for (let i = 0; i < baseMapOptions.length; i++) {
            try {
                options = baseMapOptions[i];
                if (JSHelper.IsString(options))
                    options = {
                        type: options
                    }

                if (options.type === "none") {
                    this._baseMap.clear();
                    this._viewer.clearGroup("basemap")
                    break;
                }

                // imageryLayer = ImageryLayerFactory.Create(options);
                let layer = LayerFactory.CreateAsync(options.type, options);
                layer._isBaseLayer = true;
                if (layer instanceof LayerGroup) {
                    layer.eachLayer(p => p._isBaseLayer = true, false);
                }
                this._baseMap.addLayer(layer);
            } catch (error) {

            }
        }

        //所有底图设置完毕， 触发底图更改事件
        // this._mapEvent.emit(MapEventType.BASEMAP_CHANGED, this._baseMap);
        return this.baseLayers;
    }

    /**
     * 添加图层节点
     *
     * @param {Layer|LayerGroup} layer 要添加的图层节点
     * @return {Boolean} 
     * @memberof Map
     */
    addLayer(layer) {
        if (layer instanceof Layer) {
            this._layers.push(layer);
            return true;
        }
        return false;
    }

    /**
    * 从图层组移除指定图层节点(遍历图层树)
    *
    * @param {Layer|LayerGroup} layer 要移除的图层节点
    * @return {Boolean} 
    * @memberof Map
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
    * 根据id移除指定图层节点(遍历图层树)
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
     * 根据id获取指定图层节点
     *
     * @param {String} id 图层节点id
     * @return {Layer|LayerGroup|undefined} 
     * @memberof Map
     */
    getLayerById(id) {
        if (!JSHelper.IsString(id))
            return;

        let layerNode;
        for (let i = 0; i < this._layers.length; i++) {
            if (this._layers[i]._id == id)
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
     * @memberof Map
     */
    getLayersByName(name) {
        let layers = [];
        if (JSHelper.IsString(name)) {
            for (let i = 0; i < this._layers.length; i++) {
                const element = this._layers[i];
                if (element.name === name)
                    layers.push(element);
                else if (element._type == LayerType.LAYER_GROUP)
                    layers.push(...element.getLayersByName(name));
            }
        }
        return layers;
    }



    /**
    * 遍历图层节点执行方法
    *
    * @param {*} func 入参为图层节点的迭代函数
    * @param {*} skipLayerGroupNode 是否跳过图层组节点本身
    * @param {*} context this上下文
    * @ignore
    * @memberof Map
    */
    eachLayer(func, skipLayerGroupNode, context) {
        let layer;
        for (let i = 0; i < this.layers.length; i++) {
            layer = this.layers[i];
            if (layer.type == LayerType.LAYER_GROUP) {
                if (!skipLayerGroupNode)
                    func.call(context, layer);
                layer.eachLayer(func, skipLayerGroupNode, context);
            }
            else
                func.call(context, layer);
        }
    }

    clearAllLayers() {

    }

    destroy() {
    }



    /**
     * 飞至主视图
     *
     * @param {number} [duration=2] 飞跃动画时长(秒)
     * @param {Function} [callback] 动画结束回调 
     * @memberof Map
     */
    flyHome(duration = 2, callback) {
        if (this.#homeViewPoint) {
            this.flyToViewPoint(this.#homeViewPoint, duration, callback);
        }
        else if (this.homeViewExtent) {
            this.flyToExtent(this.homeViewExtent, duration, callback)
        }
    }


    /**
     * 飞至视点
     *
     * @param {ViewPoint|Object} viewPoint 目标视点
     * @param {Number} [duration=2] 飞跃动画时长(秒)
     * @param {Function} [callback] 动画结束回调 
     * @memberof Map
     */
    flyToViewPoint(viewPoint, duration = 2, callback) {
        this._cache.stopViewPoint = undefined;
        this.viewer.camera.flyTo(
            {
                destination: Cesium.Cartesian3.fromDegrees(...viewPoint.position),
                orientation: {
                    heading: viewPoint.heading ? viewPoint.heading * Math.PI / 180 : 0,
                    pitch: viewPoint.pitch ? viewPoint.pitch * Math.PI / 180 : 0,
                    roll: viewPoint.roll ? viewPoint.roll * Math.PI / 180 : 0,
                },
                duration: duration,//in seconds
                complete: JSHelper.IsFunction(callback) ? callback : undefined
            }
        )
    }

    /**
     * 飞至指定地理范围
     *
     * @param {Number[]} extent 目标地理范围，形如[xmin,ymin,xmax,ymax]
     * @param {Number} [duration=2] 飞跃动画时长(秒)
     * @param {Function} [callback] 动画结束回调 
     * @memberof Map
     */
    flyToExtent(extent, duration = 2, callback) {
        this._cache.stopViewPoint = undefined;
        this.viewer.camera.flyTo(
            {
                destination: Cesium.Rectangle.fromDegrees(...extent),
                duration: duration,
                complete: JSHelper.IsFunction(callback) ? callback : undefined
            }
        )
    }


    /**
     *飞至指定目标
     *
     * @param {Entity|Entity[]|EntityCollection|DataSource|ImageryLayer|Cesium3DTileset|TimeDynamicPointCloud|Promise.<(Before)>} target
     * @param {Object} options
     * @memberof Map
     */
    flyToTarget(target, options) {
        this._cache.stopViewPoint = undefined;
        this.viewer.flyTo(target, options);
    }


    /**
     * 相机飞行高级控制
     *
     * @param {Object} options 相机飞行配置,参见Cesium.Camera.flyTo
     * @memberof Map
     */
    flyTo(options) {
        this._cache.stopViewPoint = undefined;
        this.viewer.camera.flyTo(options);
    }





    /**
     * 将地图中心定位至指定位置
     *
     * @param {Array.<Number>} position 要居中的点位
     * @param {Number} level 缩放层级
     * @param {number} [duration=2] 动画时长(s)
     * @param {Function} callback 动画结束回调 
     * @return {*} 
     * @memberof Map
     */
    centreAt(position, level, duration = 2, callback) {
        if (!JSHelper.IsArray(position) || position.length < 2)
            return;

        let height;
        if (!level || level == this.level)
            height = this.viewPoint.position[2];
        else {
            level = JSHelper.Clamp(level, this.minLevel, this.maxLevel);
            height = CesiumHelper.GetCameraHeightfromLevel(level, this.sceneMode);
        }

        this.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(position[0], position[1], height),
            orientation: {
                heading: 0,
                pitch: Cesium.Math.toRadians(-90),
                roll: 0.0
            },
            duration: duration,
            complete: JSHelper.IsFunction(callback) || JSHelper.IsAsyncFunction(callback) ? callback : undefined
        })


        // return new Promise(resolve => {
        //     this.flyTo({
        //         destination: Cesium.Cartesian3.fromDegrees(position[0], position[1], height),
        //         orientation: {
        //             heading: 0,
        //             pitch: Cesium.Math.toRadians(-90),
        //             roll: 0.0
        //         },
        //         duration: duration,
        //         complete: () => {
        //             const completed = JSHelper.IsFunction(callback) || JSHelper.IsAsyncFunction(callback) ? callback : undefined;
        //             if (completed)
        //                 completed.call();
        //             resolve(true)
        //         }
        //     })
        // })
    }


    /**
     * 放大地图
     *
     * @memberof Map
     */
    zoomIn() {
        this.viewer.camera.zoomIn(this.viewer.camera.positionCartographic.height / 2);
    }


    /**
     * 缩小地图
     *
     * @memberof Map
     */
    zoomOut() {
        this.viewer.camera.zoomOut(this.viewer.camera.positionCartographic.height);
    }


    /**
     * 将屏幕坐标转换为地图坐标
     *
     * @param {Number[]|Cesium.Cartesian2} windowPosition
     * @return {Number[]} 
     * @memberof Map
     */
    toMap(windowPosition) {
        if (Array.isArray(windowPosition)) {
            this._cache.cartesian2.x = windowPosition[0];
            this._cache.cartesian2.y = windowPosition[1];
        }
        else if (windowPosition.hasOwnProperty("x") && windowPosition.hasOwnProperty("y")) {
            this._cache.cartesian2.x = windowPosition.x;
            this._cache.cartesian2.y = windowPosition.y;
        }
        else
            return undefined;

        this._cache.cartesian3 = CesiumHelper.WindowToWGS84(this.viewer, this._cache.cartesian2);
        if (this._cache.cartesian3) {
            this._cache.cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(this._cache.cartesian3);
            return [
                this._cache.cartographic.longitude * Cesium.Math.DEGREES_PER_RADIAN,
                this._cache.cartographic.latitude * Cesium.Math.DEGREES_PER_RADIAN,
                this._cache.cartographic.height
            ]
        }
        return undefined;
    }


    /**
     * 添加交互
     *
     * @param {*} interaction
     * @return {Boolean} 
     * @memberof Map
     */
    addInteraction(interaction) {
        if (!(interaction instanceof Interaction))
            return false;

        switch (interaction.interactionType) {
            case "draw":
                if (this.drawTool == interaction)
                    return false;

                this.removeInteraction(this._interactions.drawTool);
                this._interactions.drawTool = interaction;
                this._interactions.drawTool.event.emit(DrawEventType.DRAW_MOUNETD, this);
                break;

            case "measure":
                if (this.measureTool == interaction)
                    return false;

                this.removeInteraction(this._interactions.measureTool);
                this._interactions.measureTool = interaction;
                this._interactions.measureTool.event.emit(DrawEventType.DRAW_MOUNETD, this);
                break
            default:
                return false;
        }
        return true;
    }


    /**
     * 移除交互
     *
     * @param {*} interaction
     * @return {Boolean} 
     * @memberof Map
     */
    removeInteraction(interaction) {
        if (!(interaction instanceof Interaction))
            return false;

        interaction.event.emit(DrawEventType.DRAW_UNMOUNTED, this);
        interaction.destrory();
        this._interactions[`${interaction.interactionType}Tool`] = undefined;
    }


    addOverlay(overlay) {
        if (overlay instanceof Popup) {
            if (overlay.update)
                this._dynamicOverlays.push(overlay);
            else
                this._overlays.push(overlay);
            overlay.event.emit("added", this);
            return true;
        }
    }
    removeOverlay(overlay) {
        if (overlay instanceof Popup) {
            let overlays = overlay.update ? this._dynamicOverlays : this._overlays;
            let index = overlays.indexOf(overlay);
            if (index > -1) {
                overlays.splice(index, 1);
                overlay.event.emit("removed");
                return true;
            }
        }
        return false;
    }

    /**
     * 识别指定窗口位置目标
     *
     * @param {Object} wp 窗口坐标,形如 {x:95,y:27}
     * @return {Object|undefined} 
     * @memberof Map
     */
    async identifyAsync(wp, options) {
        // //基于显存查询
        // if (mouseInfo.target.delegate)
        //     return mouseInfo.target;

        //WMS查询
        let layers = [];
        // this.eachLayer((layer) => {
        //     if (layer.type == LayerType.WMS_LAYER && layer.pickable && layer.visible)
        //         layers.push(layer);
        // }, true);

        //WFS
        this.eachLayer((layer) => {
            if (layer.type == LayerType.WFS_LAYER && layer.pickable && layer.visible)
                layers.push(layer);
        }, true);


        let layer, promises = [], promise;
        for (let i = 0; i < layers.length; i++) {
            layer = layers[i];
            promise = layer.pickFeatures(wp, options);
            if (promise)
                promises.push(promise);
        }

        if (promises.length == 0)
            return undefined;
        const results = (await Promise.all(promises));
        return results.find(p => {
            return Boolean(p);
        })
    }



    // /**
    //  * 获取批量图层数据范围
    //  *
    //  * @param {Array.<String>} ids 图层id数组
    //  * @param {Number} [ratio=0.1] 扩张系数(0-1)
    //  * @return {Promise.<Array|undefined>} 
    //  * @memberof Map
    //  */
    // getBatchLayerDataExtentAsync(ids, ratio = 0.1) {
    //     if (!Array.isArray(ids))
    //         return undefined;

    //     const validTypes = [LayerType.WMS_LAYER, LayerType.POINT_ENTITY_LAYER]
    //     let layer, layers = [];
    //     for (let i = 0; i < ids.length; i++) {
    //         layer = this.getLayerById(ids[i]);
    //         if (layer && validTypes.indexOf(layer.type) > -1)
    //             layers.push(layer);
    //     }

    //     if (layers.length === 0)
    //         return undefined;

    //     return Promise.all(layers.map(p => p.getDataExtentAsync())).then(values => {
    //         if (values.length === 0)
    //             return undefined;

    //         let extent = values[0];
    //         let value;
    //         for (let i = 1; i < values.length; i++) {
    //             value = values[i];
    //             if (value[0] < extent[0])
    //                 extent[0] = value[0];
    //             if (value[1] < extent[1])
    //                 extent[1] = value[1];
    //             if (value[2] > extent[2])
    //                 extent[2] = value[2];
    //             if (value[3] > extent[3])
    //                 extent[3] = value[3];
    //         }
    //         const extend = Math.max(Math.abs(extent[0] - extent[2]), Math.abs(extent[1] - extent[3])) * ratio;
    //         return [
    //             JSHelper.Clamp(extent[0] - extend, -180, 180),
    //             JSHelper.Clamp(extent[1] - extend, -90, 90),
    //             JSHelper.Clamp(extent[2] + extend, -180, 180),
    //             JSHelper.Clamp(extent[3] + extend, -90, 90),
    //         ]


    //     }).catch(reason => {
    //         console.error(`set extent by layers failed:${reason}`)
    //         return undefined;
    //     });
    // }

    //#region 内部方法
    #initDelegate(mapContainer, options) {
        // var wgs84_wgs84_mapcrs = {
        //     // topTileExtent: [-180, -270, 180, 90],
        //     topTileExtent: [-180, -90, 180, 90],

        //     tileSize: 256
        // };

        //层级限定
        let minLevel = JSHelper.Clamp(options.minLevel || 2, 2, 20);
        let maxLevel = JSHelper.Clamp(options.maxLevel || 20, 3, 20);
        this._cache.minLevel = Math.min(minLevel, maxLevel);
        this._cache.maxLevel = Math.max(minLevel, maxLevel);
        this._cache.sceneMode = options.sceneMode || 3;


        //初始视点、初始范围
        if (options.homeViewPoint) {
            this.#homeViewPoint = options.homeViewPoint
        }
        else if (options.center && options.level) {
            if (!JSHelper.IsArray(options.center) || options.center.length < 2)
                throw new Error(`invalid center:${options.center}->center is specified by an array`);
            if (options.level < minLevel || options.level > maxLevel)
                throw new Error(`invalid level:${+options.level}->the level should be between minLevel(${minLevel}) and maxLevel(${maxLevel})`)
            // let height = CesiumHelper.GetCameraHeightfromLevel(+options.level, this.sceneMode);
            this.#homeViewPoint = new ViewPoint([options.center[0], options.center[1], options.level], 0, this._cache.sceneMode == 3 ? 45 : 0, 0);
        }
        else {
            this.#homeViewPoint = new ViewPoint([118.778, 32.043, this._cache.minLevel], 0, this._cache.sceneMode == 3 ? 45 : 0, 0);
        }



        this._viewer = new GeoGlobe.Map({
            container: mapContainer, //绑定容器
            // mapCRS: wgs84_wgs84_mapcrs, //定义坐标系
            mapCRS: options.crs || "4490",
            minZoom: minLevel, //8 最小缩放级别
            maxZoom: maxLevel, //最大缩放级别
            center: [this.homeViewPoint.position[0], this.homeViewPoint.position[1]], //定位中心点
            zoom: this.#homeViewPoint.position[2], //当前缩放级别
            pitch: this.#homeViewPoint.pitch,
            bearing: this.#homeViewPoint.heading
        });

        const self = this;

        //地图事件
        this._mapEvent = new MapEvent(this._viewer);

        //鼠标事件
        this._mouseEvent = new MouseEvent(this);

        return new Promise((resolve, reject) => {
            self._viewer.on('load', function () {
                const layers = self.viewer.getStyle().layers;
                const firstLayerID = layers[0]?.id || undefined
                self.viewer.addLayerGroup([], "basemap");
                self.viewer.moveLayer("GeoGlobebasemap", firstLayerID)



                self.sceneMode = self._cache.sceneMode;
                //注册事件
                self.#initEvents();

                //设置底图
                const baseMapOptions = options.baseMap || [
                    {
                        type: "geo_tile_dt"
                        // correct: false,
                    }
                ];
                self.setBaseMap(baseMapOptions);

                //触发地图视图初次加载完毕事件
                if (self.mapEvent._events[MapEventType.VIEW_LOADED]._listeners.length > 0)
                    self.mapEvent.emit(MapEventType.VIEW_LOADED, this);

                resolve(true)
            })
        })

        // Cesium.Ion.defaultAccessToken = options.token || "e707ea185bb3d8dc7092609227732787"
        // this._debugger = options.debugger;


        // //范围限定
        // this._cache.restrictedViewExtent = options.restrictedViewExtent;
        // //----(如果初始进入2D，立即计算实际限制对应的ViewExtent，否则，在切入时机计算)
        // if (this.sceneMode == 2 && this._cache.restrictedViewExtent) {
        //     //短暂飞入以快速测算限定范围
        //     this.flyToExtent(this._cache.restrictedViewExtent, 0.1, () => {
        //         if (this.isRequestRenderMode)
        //             this.requestRender();

        //         this._cache.restrictedViewExtent = this.extent;//计算真正的视图范围
        //         this._cache.realRestrictedViewExtentComputed = true;
        //     })
        // }
    }

    #initWidgets(widgets) {
        this.#ui = new WidgetManager(this);

        if (!JSHelper.IsObject(widgets)) {
            return;
        }

        let keys = Object.keys(widgets);
        let widgetName;
        Object.values(widgets).forEach((value, index) => {
            if (JSHelper.IsBoolean(value)) {
                if (value) {
                    widgetName = keys[index];
                    this.ui.add(widgetName);
                }
            }
            else {
                this.ui.add(value);
            }
        })







    }

    #initEvents() {



        // //鼠标事件
        // this._mouseEvent = new MouseEvent(this);

        //----挂载内置事件回调
        this._mapEvent.on(MapEventType.LAYER_ADDED, this.#onLayerAdded, this);
        this._mapEvent.on(MapEventType.LAYER_REMOVED, this.#onLayerRemoved, this);
        // this._mapEvent.on(MapEventType.BASEMAP_CHANGED, this.#onBaseMapChanged, this);
        // this._mapEvent.on(MapEventType.BEFORE_SCENE_MODE_CHANGING, this.#beforSceneModeChaning, this);
        // this._mapEvent.on(MapEventType.SCENE_MODE_CHANGED, this.#onSceneModeChanged, this);
        // this._mapEvent.on(MapEventType.CAMERA_CHANGED, this.#onCameraChanegd, this);
        // this._mapEvent.on(MapEventType.EXTENT_CHANGED, this.#onExtentChanged, this);
        // this._mapEvent.on(MapEventType.PRE_RENDER, this.#preRender, this);
        // // this._mapEvent.on(MapEventType.POST_RENDER, this.#postRender, this);
        // this._mapEvent.on(MapEventType.CAMERA_MOVE_START, this.#onCameraMoveStart, this);
        // this._mapEvent.on(MapEventType.CAMERA_MOVE_END, this.#onCameraMoveEnd, this);
        // this._mapEvent.on(MapEventType.POST_UPDATE, this.#onPostUpdate, this);

        // this._mouseEvent.on(MouseEventType.MOUSE_WHEEL, this.#onMouseWheeled, this);
        // this._mouseEvent.on(MouseEventType.MIDDLE_DOWN, this.#onMiddleDown, this);
        // this._mouseEvent.on(MouseEventType.MIDDLE_UP, this.#onMiddleUp, this);
        // this._mouseEvent.on(MouseEventType.MOUSE_MOVE, this.#onMouseMove, this);




        //----注册图层集合更改回调
        this._layers.addHandler((obj) => {
            let isAddOption = ["push", "unshift"].indexOf(obj.type) > -1 ? true : false;
            let layers = obj.data;
            let index;
            layers.forEach(layer => {
                if (isAddOption) {
                    if (this._cache.layerIds.has(layer.id)) {
                        message.warn(`add layer failed: layerID ${layer.id} is already exists`, 4.5);
                        console.warn(`add layer failed: layerID ${layer.id} is already exists`);
                        index = this._layers.findIndex(value => { return value === layer });
                        if (index > -1) {
                            layer._preventDefault = true;//标记不触发移除事件
                            this._layers.splice(index, 1);
                        }
                    }
                    else
                        this._mapEvent.emit(MapEventType.LAYER_ADDED, layer);
                }
                else {
                    if (layer._preventDefault)
                        delete layer["_preventDefault"];
                    else {
                        const layerID = layer.id;
                        this._mapEvent.emit(MapEventType.LAYER_REMOVED, layer);
                        this._cache.layerIds.delete(layerID);
                    }
                }
            });
        })
    }


    // #onBaseMapChanged(baseMap) {
    //     // console.log(`basemap has been changed:added`);
    // }

    #onLayerAdded(layer) {
        layer.layerEvent.emit(LayerEventType.ADDED, this);
        this._cache.layerIds.add(layer.id);
    }


    #onLayerRemoved(layer) {
        if (layer.id == this.baseMap.id)
            throw new Error(`the base map is protected and cannot be removed`);


        layer.layerEvent.emit(LayerEventType.REMOVED, this);
        this._cache.layerIds.delete(layer.id);
    }


    #beforSceneModeChaning(eventArg) {
        //记录模式切换前的视点信息
        let viewPoint = this.viewPoint;
        this._cache.viewPointBeforSceneModeChanging.position[0] = viewPoint.position[0];
        this._cache.viewPointBeforSceneModeChanging.position[1] = viewPoint.position[1];
        this._cache.viewPointBeforSceneModeChanging.position[2] = viewPoint.position[2];
        this._cache.viewPointBeforSceneModeChanging.heading = viewPoint.heading;
        this._cache.viewPointBeforSceneModeChanging.pitch = viewPoint.pitch;
        this._cache.viewPointBeforSceneModeChanging.roll = viewPoint.roll;
    }

    #onSceneModeChanged(params) {
        // console.log(`current sceneMode is ${params.sceneMode},previous sceneMode is ${params.preSceneMode}`);
        const self = this;
        setTimeout(() => {
            let isPreViewPointInRestrictedExtent;
            //初次切入二维模式,计算真正的视图限制范围
            if (params.sceneMode == 2) {
                //处理范围限制
                if (self._cache.restrictedViewExtent) {
                    if (!self._cache.realRestrictedViewExtentComputed) {
                        self.camera.setView({
                            destination: Cesium.Rectangle.fromDegrees(...this._cache.restrictedViewExtent)
                        });
                        this.requestRender();
                        self._cache.restrictedViewExtent = self.extent;//计算真正的视图范围
                        self._cache.realRestrictedViewExtentComputed = true;
                    }
                }
                //核查恢复视点是否落在约束举行框内
                if (self._cache.restrictedViewExtent) {
                    let restrictedRectangle = Cesium.Rectangle.fromDegrees(...self._cache.restrictedViewExtent);
                    isPreViewPointInRestrictedExtent = Cesium.Rectangle.contains(restrictedRectangle, Cesium.Cartographic.fromDegrees(this._cache.viewPointBeforSceneModeChanging.position[0], this._cache.viewPointBeforSceneModeChanging.position[1]));
                }
            }

            //近似恢复到变换前视图(不能立即调用，很奇怪) or 跳转到约束视图
            this._cache.isRestorePreView = true;
            if (isPreViewPointInRestrictedExtent === false) {
                self.flyToExtent(this._cache.restrictedViewExtent, 2, () => {
                    //标定视点恢复阶段结束
                    this._cache.isRestorePreView = false;
                })
            }
            else {
                self.flyToViewPoint(this._cache.viewPointBeforSceneModeChanging, 2, () => {
                    //标定视点恢复阶段结束
                    this._cache.isRestorePreView = false;
                })
            }
        }, 100)


        this.layers.forEach(p => {
            if (p instanceof EntityLayer)
                p.layerEvent.emit(LayerEventType.SCENE_MODE_CHANGED, p);
        })

    }

    //内置相机更改事件回调
    #onCameraChanegd(percentageChanged) {
        //初次进入主视图 or 处于模式切换状态,不触发视图更改事件
        if (this.sceneMode == 0 || !this._cache.viewLoaded)
            return;


        //触发层级变动事件
        // if (this.mapEvent._events[MapEventType.LEVEL_CHANGED]._listeners.length > 0) {
        if (this.level != this._cache.preLevel) {
            this.mapEvent.emit(MapEventType.LEVEL_CHANGED, { level: this.level, preLevel: this._cache.preLevel });
            this._cache.preLevel = this.level;
        }
        // }


        //触发视点变化事件
        // if (this.mapEvent._events[MapEventType.VIEW_POINT_CHANGED]._listeners.length > 0) {
        let viewPoint = this.viewPoint;
        this.mapEvent.emit(MapEventType.VIEW_POINT_CHANGED, { viewPoint: viewPoint, preViewPoint: this._cache.preViewPoint });
        this._cache.preViewPoint.position[0] = viewPoint.position[0];
        this._cache.preViewPoint.position[1] = viewPoint.position[1];
        this._cache.preViewPoint.position[2] = viewPoint.position[2];
        this._cache.preViewPoint.heading = viewPoint.heading;
        this._cache.preViewPoint.pitch = viewPoint.pitch;
        this._cache.preViewPoint.roll = viewPoint.roll;
        // }

        //触发视图更改事件
        if (this.mapEvent._events[MapEventType.EXTENT_CHANGED]._listeners.length > 0) {
            let extent = this.extent;
            if (extent?.toString() != this._cache.preExtent?.toString()) {
                this.mapEvent.emit(MapEventType.EXTENT_CHANGED, { extent: extent ? [...extent] : undefined, preExtent: this._cache.preExtent ? [...this._cache.preExtent] : undefined });
                this._cache.preExtent = extent;
            }
        }
    }

    #onExtentChanged(eventArg) {
        //范围限定
        if (!this._cache.isRestorePreView && this.viewer.scene.mode == 2 && this._cache.realRestrictedViewExtentComputed) {
            let extent = this.extent;
            if (extent[0] < this._cache.restrictedViewExtent[0] || extent[1] < this._cache.restrictedViewExtent[1] || extent[2] > this._cache.restrictedViewExtent[2] || extent[3] > this._cache.restrictedViewExtent[3]) {
                if (!this._cache.stopViewPoint) {
                    this._cache.stopViewPoint = {
                        position: Cesium.Cartesian3.fromDegrees(...this._cache.preViewPoint.position),
                        orientation: {
                            heading: Cesium.Math.RADIANS_PER_DEGREE * this._cache.preViewPoint.heading,
                            pitch: Cesium.Math.RADIANS_PER_DEGREE * this._cache.preViewPoint.pitch,
                            roll: Cesium.Math.RADIANS_PER_DEGREE * this._cache.preViewPoint.roll,
                        }
                    }
                }
                this.viewer.scene.camera.setView({
                    destination: this._cache.stopViewPoint.position,
                    orientation: this._cache.stopViewPoint.orientation
                });

                //取消相机飞跃动画
                // if (this.isCameraFlying) {
                //     // this.viewer.camera._currentFlight.cancelTween();
                // }
                if (this._debugger) {
                    console.warn(`视图即将超出限定范围，视图更改被中止！`)
                }
            }
            else {
                this._cache.stopViewPoint = undefined;
            }
        }
    }

    #onMouseWheeled(delta) {
        //根据层级范围限定缩放
        if ((this.level > this.minLevel && this.level < this.maxLevel) || (this.level <= this.minLevel && delta > 0) || (this.level >= this.maxLevel && delta < 0))
            this._viewer.scene.screenSpaceCameraController.enableZoom = true;
        else
            this._viewer.scene.screenSpaceCameraController.enableZoom = false;
    }

    #onMiddleDown(mouseInfo) {
        //标识相机倾角操作状态开启
        this._cache.isInPitchOperation = true;
    }

    #onMiddleUp(mouseInfo) {
        //标识相机倾角操作状态结束
        this._cache.isInPitchOperation = false;
    }

    #onMouseMove(mouseInfo) {
        //根据层级范围限定相机倾角(仅需限制2.5/3D)
        if (this._cache.isInPitchOperation && [0, 2].indexOf(this.sceneMode) == -1) {
            let isUp = mouseInfo.windowPosition.y < mouseInfo.preWindowPosition.y;

            if ((this.level > this.minLevel && this.level < this.maxLevel)) {
                this._viewer.scene.screenSpaceCameraController.enableTilt = true;
                return;
            }

            if (this.level <= this.minLevel && isUp) {
                this._viewer.scene.screenSpaceCameraController.enableTilt = true;
                return;
            }

            if (this.level >= this.maxLevel && !isUp) {
                this._viewer.scene.screenSpaceCameraController.enableTilt = true;
                return;
            }

            //临界情况，别面锁死倾角
            if ((this.viewPoint.pitch <= -45 && isUp) || (this.viewPoint.pitch >= 10 && !isUp)) {
                this._viewer.scene.screenSpaceCameraController.enableTilt = true;
                return;
            }
            this._viewer.scene.screenSpaceCameraController.enableTilt = false;
        }
    }

    #preRender(scene) {
        if (scene.mode != 0) {
            //#region 层级限定

            let dynamicMinCameraHeight = scene.mode == 2 ? this._cache.dynamicMinCameraHeight2D : this._cache.dynamicMinCameraHeight;

            //限定最小相机高度(2.5/3D相机高度存在突变现象,2D限制相机高度来限制层级)
            if (scene.camera.positionCartographic.height < dynamicMinCameraHeight) {
                scene.camera.setView({
                    destination: Cesium.Cartesian3.fromRadians(scene.camera.positionCartographic.longitude, scene.camera.positionCartographic.latitude, dynamicMinCameraHeight),
                    orientation: {
                        direction: scene.camera.direction,
                        up: scene.camera.up
                    }
                })
            }

            if (scene.mode != 2)//2.5D/3D
            {
                //限制最大倾角(2.5D倾角会突变得很大)
                if (scene.camera.pitch > Cesium.Math.RADIANS_PER_DEGREE * this._cache.maxPitch) {
                    // console.info(`pitch limited`)
                    scene.camera.setView({
                        destination: Cesium.Cartesian3.fromRadians(scene.camera.positionCartographic.longitude,
                            scene.camera.positionCartographic.latitude,
                            Math.max(dynamicMinCameraHeight, scene.camera.positionCartographic.height)),
                        orientation: {
                            pitch: Cesium.Math.RADIANS_PER_DEGREE * 10
                        }
                    })
                }
            }

            //#endregion


            //#region 范围限定(仅对2D启用;相机飞行状态禁止)
            // if (scene.mode == 2 && this._cache.realRestrictedViewExtentComputed && this._cache.viewLoaded) {
            //     let extent = this.extent;
            //     if (extent[0] < this._cache.restrictedViewExtent[0] || extent[1] < this._cache.restrictedViewExtent[1] || extent[2] > this._cache.restrictedViewExtent[2] || extent[3] > this._cache.restrictedViewExtent[3]) {
            //         if (!this._cache.stopViewPoint) {
            //             this._cache.stopViewPoint = {
            //                 position: Cesium.Cartesian3.fromDegrees(...this._cache.preViewPoint.position),
            //                 orientation: {
            //                     heading: Cesium.Math.RADIANS_PER_DEGREE * this._cache.preViewPoint.heading,
            //                     pitch: Cesium.Math.RADIANS_PER_DEGREE * this._cache.preViewPoint.pitch,
            //                     roll: Cesium.Math.RADIANS_PER_DEGREE * this._cache.preViewPoint.roll,
            //                 }
            //             }
            //         }
            //         scene.camera.setView({
            //             destination: this._cache.stopViewPoint.position,
            //             orientation: this._cache.stopViewPoint.orientation
            //         });

            //         //取消相机飞跃动画
            //         if (this.isCameraFlying) {
            //             this.viewer.camera._currentFlight.cancelTween();
            //         }

            //         if (this._debugger) {
            //             console.warn(`视图即将超出限定范围，视图更改被中止！`)
            //         }
            //     }
            //     else {
            //         this._cache.stopViewPoint = undefined;
            //     }
            // }
            //#endregion
        }
    }


    // #postRender(scene) {
    //     // this._popup._render();
    // }


    #onPostUpdate() {
        //动态popups
        if (this._dynamicOverlays.length == 0)
            return;

        if (!Cesium.Cartesian3.equals(this._cache.ellipsoidalOccluder.cameraPosition, this._camera.position))
            this._cache.ellipsoidalOccluder.cameraPosition = this._camera.position;

        let popup;
        for (let i = 0; i < this._dynamicOverlays.length; i++) {
            popup = this._dynamicOverlays[i];
            popup.update();

            if (!popup.location)
                continue;

            if (this.sceneMode == 3)
                popup.visible = popup._open & this._cache.ellipsoidalOccluder.isPointVisible(popup.location);
            else if (this.sceneMode != 0) {
                popup.visible = popup._open;
            }

            if (popup.visible)
                popup._render();
        }

    }

    #onCameraMoveStart() {
        if (this._overlays.length == 0)
            return;
        this._cache.updatePopupsFun = this.mapEvent.on(MapEventType.POST_UPDATE, (scene) => {
            this._cache.ellipsoidalOccluder.cameraPosition = this._camera.position;
            let popup;
            for (let i = 0; i < this._overlays.length; i++) {
                popup = this._overlays[i];

                if (!popup.location)
                    continue;

                if (this.sceneMode == 3)
                    popup.visible = popup._open & this._cache.ellipsoidalOccluder.isPointVisible(popup.location);
                else if (this.sceneMode != 0) {
                    popup.visible = popup._open;
                }

                if (popup.visible)
                    popup._render();
            }
        }, this);
    }

    #onCameraMoveEnd() {
        if (this._cache.updatePopupsFun) {
            this._cache.updatePopupsFun.call();
            this._cache.updatePopupsFun = undefined;
        }
    }

    //#endregion

}



export { Map };

