import CEvent from "../../../libs/Event.js";
import { Event } from "./Event.js";


import { MapEventType } from "./EventType.js"

/**
 * @summary 地图事件。请勿自行创建该类实例
 * @see MapEventType
 * @extends {Event}
 */
class MapEvent extends Event {
    #viewer;
    constructor(viewer) {
        super();
        this.#viewer = viewer;
        this._init();
    }
    _init() {
        Object.values(MapEventType).forEach(value => {

            switch (value) {
                // case MapEventType.BEFORE_SCENE_MODE_CHANGING:
                //     this._events[value] = this.#viewer.scene.morphStart;
                //     break;
                // case MapEventType.SCENE_MODE_CHANGED:
                //     this._events[value] = this.#viewer.scene.morphComplete;
                //     break;
                // case MapEventType.CAMERA_CHANGED:
                //     this._events[value] = this.#viewer.camera.changed;
                //     break;
                // case MapEventType.CAMERA_MOVE_START:
                //     this._events[value] = this.#viewer.camera.moveStart;
                //     break;
                // case MapEventType.CAMERA_MOVE_END:
                //     this._events[value] = this.#viewer.camera.moveEnd;
                //     break;
                // case MapEventType.PRE_RENDER:
                //     this._events[value] = this.#viewer.scene.preRender;
                //     break;
                // case MapEventType.POST_RENDER:
                //     this._events[value] = this.#viewer.scene.postRender;
                //     break;
                // case MapEventType.POST_UPDATE:
                //     this._events[value] = this.#viewer.scene.postUpdate;
                //     break;
                // case MapEventType.TICK:
                //     this._events[value] = this.#viewer.clock.onTick;
                //     break;
                default:
                    this._events[value] = new CEvent();
                    break;
            }
        }, this);


        //注册cesium事件
        // this.#viewer.scene.morphStart.addEventListener(this.#onMorthStart);
        // this.#viewer.scene.morphComplete.addEventListener(this.#onMorphComplete);
    }

    // #onMorphComplete(eventArg) {
    //     //参数规范化处理
    //     eventArg.preSceneMode = eventArg._previousMode;
    //     eventArg.sceneMode = eventArg._scene.mode;
    // }
}

export { MapEvent }