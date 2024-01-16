import { JSHelper } from "../../../libs/JSHelper.js";
import CEvent from "../../../libs/Event.js"

/**
 * @summary 事件基类。负责事件的订阅、移除、触发
 * 
 */
class Event {
    _events;
    constructor(types) {
        this._events = {};

        let eventTypes = JSHelper.IsArray(types) ? types : []
        eventTypes.forEach(type => {
            this._events[type] = new CEvent();
        });
    }




    /**
     * 获取指定类型事件
     *
     * @param {*} type
     * @return {*} 
     * @memberof Event
     */
    getEvent(type) {
        return this._events[type];
    }

    /**
     * 订阅事件回调
     *
     * @param {String} type 事件类型 
     * @param {Function} callback 事件回调
     * @param {Object} [context=undefined]
     * @returns {CEvent.RemoveCallback} 移除回调
     * @memberof Event
     * 
     */
    on(type, callback, context) {
        let event = this._events[type];
        if (!(event instanceof CEvent))
            return;

        // if (!JSHelper.IsFunction(callback) || !JSHelper.IsAsyncFunction(callback))
        //     return;

        if (typeof callback != "function")
            return false;


        return event.addEventListener(callback, context)
    }



    /**
     * 订阅单次事件回调
     *
     * @param {String} type 事件类型
     * @param {Function} callback 事件回调
     * @param {Object} [context=undefined]
     * @memberof Event
     */
    once(type, callback, context) {
        let removeCallback = this.on(type, (e) => {
            callback.call(context, e);
            removeCallback && removeCallback.call();
        }, context)
    }


    /**
     * 移除事件回调
     *
     * @param {String} type 事件类型
     * @param {Function} callback 事件回调
     * @returns {Boolean} 标识是否移除成功
     * @memberof Event
     */
    off(type, callback, context) {
        let event = this._events[type];
        if (!(event instanceof CEvent))
            return false;

        // if (!JSHelper.IsFunction(callback) || !JSHelper.IsAsyncFunction(callback))
        //     return false;

        if (typeof callback != "function")
            return false;


        return event.removeEventListener(callback, context);
    }

    /**
     * 触发事件
     *
     * @param {String} type 事件类型
     * @param {...Object} params 事件参数
     * @memberof Event
     */
    emit(type, ...params) {
        let event = this._events[type];
        if (!(event instanceof CEvent))
            return;

        event.raiseEvent(...params);
    }

    _init() {
        console.warn(`Event._init should be overwritten in subclass`)
    }

}

export { Event }