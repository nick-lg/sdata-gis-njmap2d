import { TargetType } from "../base/Constants.js";
import { Map } from "../map/Map.js";
import CEvent from "../../../libs/Event.js";
import { Event } from "./Event.js";

import { MouseEventType } from "./EventType.js"
import { map } from "leaflet";

/**
 *
 * @summary 鼠标事件。请勿自行创建该类实例
 * @see MouseEventType
 * @extends {Event}
 */
class MouseEvent extends Event {

    /**
     * @type {Map} 
     * @private
    */
    _map;
    constructor(map) {
        super();

        this._map = map;

        this._init();

    }


    //for permormance:do not change this value in callback

    _cache = {
        // ray: new Cesium.Ray(),
        target: undefined,
        // cartesian: new Cesium.Cartesian3(),//基于缓冲区拾取到的地物坐标(cartesian3)
        wgs84Position: { lng: undefined, lat: undefined, alt: undefined },//基于缓冲区拾取到的地物坐标(经纬度+海拔高)
        // surfaceCartesian: new Cesium.Cartesian3(),//基于射线法拾取到的地球表面坐标(cartesian3)
        wgs84SurfacePosition: { lng: undefined, lat: undefined, alt: undefined },//基于射线法拾取到的地球表面坐标(经纬度+海拔高)
        // cartographic: new Cesium.Cartographic(),
        foundSurfacePosition: false,//标识是否获取到地表位置
        foundPosition: false,//标识是否获取到地物位置


        //鼠标事件回调参数
        eventArg: {
            target: undefined,//拾取到的首个地物
            // preWindowPosition:will appear for mouse move
            windowPosition: undefined,//窗口坐标
            position: undefined,//基于缓冲区拾取到的地物坐标(cartesian3)，不稳定
            wgs84Position: undefined,//基于缓冲区拾取到的地物坐标(经纬度+海拔高),不稳定
            surfacePosition: undefined,//基于射线法拾取到的地球表面坐标(cartesian3)
            wgs84SurfacePosition: undefined,//基于射线法拾取到的地球表面坐标(经纬度+海拔高)
        },
    }

    _init() {
        //事件声明
        Object.values(MouseEventType).forEach(value => {
            this._events[value] = new CEvent();
        })

        //注册cesium事件
        // const handler = new Cesium.ScreenSpaceEventHandler(this._map._viewer.canvas)
        // handler.setInputAction(movement => {
        //     this._onMouseClicked(movement)
        // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this._map.viewer.on("click", this._onMouseClicked.bind(this));
        this._map.viewer.on("contextmenu", this._onMouseRightClicked.bind(this));
    }


    //#region 第一级事件回调

    _onMouseClicked(movement) {
        if (!movement?.lngLat) {
            return;
        }

        if (this._events[MouseEventType.CLICK]._listeners.length == 0)
            return;

        //统一鼠标信息
        let mouseInfo = this._getMouseInfo({ x: movement.point.x, y: movement.point.y }, movement);
        this.emit(MouseEventType.CLICK, mouseInfo);
    }


    _onMouseRightClicked(movement) {
        if (!movement?.lngLat) {
            return;
        }

        if (this._events[MouseEventType.RIGHT_CLICK]._listeners.length == 0)
            return;

        //统一鼠标信息
        let mouseInfo = this._getMouseInfo({ x: movement.point.x, y: movement.point.y }, movement);
        this.emit(MouseEventType.RIGHT_CLICK, mouseInfo);
    }


    //#endregion


    /**
    *
    * 获取鼠标指针拾取到的位置+地物信息
    * @param position
    * @private
    *
    */
    _getMouseInfo(position, ev, isMouseMove) {
        if (ev) {
            this._cache.wgs84Position.lng = ev.lngLat.lng;
            this._cache.wgs84Position.lat = ev.lngLat.lat;
            this._cache.wgs84Position.alt = 0;


            this._cache.wgs84SurfacePosition.lng = ev.lngLat.lng;
            this._cache.wgs84SurfacePosition.lat = ev.lngLat.lat;
            this._cache.wgs84SurfacePosition.alt = 0;
        }

        //地物拾取
        if (isMouseMove) {
            //for performance,do not pick anything
            this._cache.target = undefined;
        }
        else {
            //目标信息
            this._cache.target = this._map._viewer.queryRenderedFeatures(ev.point)[0];
            this._cache.target = this._getTargetInfo(this._cache.target);

            //如果图层设定不支持拾取，销毁拾取信息(为不影响图层鼠标事件执行，保留图层信息)
            if (this._cache.target?.layer && !this._cache.target.layer.pickable) {
                this._cache.target.delegate = undefined;
                this._cache.target.type = undefined;
            }
        }

        //鼠标事件回调参数(出于性能要求，请以只读方式在回调函数中使用)
        this._cache.eventArg.target = this._cache.target;
        this._cache.eventArg.windowPosition = { x: position.x, y: position.y };

        if (this._cache.wgs84Position) {
            this._cache.eventArg.wgs84Position = this._cache.wgs84Position;

        }


        if (this._cache.wgs84SurfacePosition) {
            this._cache.eventArg.wgs84SurfacePosition = this._cache.wgs84SurfacePosition;
        }
        else {
            this._cache.eventArg.wgs84SurfacePosition = undefined;
        }
        return this._cache.eventArg;
    }


    /**
     * Returns the target information for the mouse event
     * @param target
     * @returns {{instanceId: *, overlay: undefined, feature: undefined, layer: undefined}}
     * @private
     */
    _getTargetInfo(target) {
        if (!target)
            return;

        let targetInfo = {
            delegate: target,//cesium实际返回的对象
            layer: undefined,//目标所在图层
            type: undefined,//目标类型
            // pickID:undefined, //for highlight 非常有限
        }

        if (target.type == "Feature") {
            targetInfo.layer = this._map.getLayerById(target.layer?.id);
            targetInfo.type = TargetType.FEATURE;
        }

        return targetInfo;
    }

    /**
      * 触发指定类型事件
      *
      * @param {String} type 事件类型，可选值取决于具体子类
      * @param {*} params 事件参数
      * @memberof MouseEvent
      */
    emit(type, params) {
        let event;
        event = params.target?.layer?.layerEvent._events[type];
        if (event && event._listeners.length > 0)//触发图层鼠标事件
        {
            event.raiseEvent(params);
        }
        else {  //触发地图的鼠标事件
            event = this._events[type];
            if (event && event._listeners.length > 0)
                event.raiseEvent(params);
        }
    }
}

export { MouseEvent }