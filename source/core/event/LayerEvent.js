import CEvent from "../../../libs/Event.js";

import { Event } from "./Event.js";

import { LayerEventType } from "./EventType.js"


/**
 *
 * @summary 图层事件。请勿自行创建该类实例
 * @see LayerEventType
 * @extends {Event}
 */
class LayerEvent extends Event {
    constructor() {
        super();
        this._init();
    }

    _init() {
        Object.values(LayerEventType).forEach(value => {
            this._events[value] = new CEvent();
        })
    }
}

export { LayerEvent }