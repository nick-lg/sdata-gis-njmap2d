import { Map } from "../core/map/Map.js";


/**
 *
 * @summary 内置组件ViewMolde基类。请勿自行创建该类实例。
 * @private
 *
 */
class WidgetViewModel
{
    _map;

    /**
     * 关联地图实例
     * @type {Map}
     * @readonly
     * @memberof WidgetViewModel
     */
    get map()
    {
        return this._map;
    }
    
    constructor(options)
    {
        this._map=options.map;
    }
}
export {WidgetViewModel}