import { SimpleMarkerSymbol } from "../symbol/SimpleMarkerSymbol.js";
import { SimpleLineSymbol } from "../symbol/SimpleLineSymbol.js";





//范围常量
const EXTENT_WORLD = [-180, 180, -90, 90];
const EXTENT_CHINA = [73, 3, 136, 54];

//地图级别常量
const MAPLEVEL_MIN = 0;
const MAPLEVEL_MAX = 25;
const MAPLEVEL_GLOBAL = 1;
const MAPLEVEL_NATION = 3;
const MAPLEVEL_PROVINCE = 6;
const MAPLEVEL_CITY = 10;
const MAPLEVEL_COUNTY = 11;
const MAPLEVEL_TOWN = 14;
const MAPLEVEL_STREET = 16;

//图层常量
const LAYERTYPE_IMAGERY = 0;
const LAYERTYPE_TERRAIN = 2;
const LAYERTYPE_ENTITY = 4;
const LAYERTYPE_PRIMITIVE = 8;

//默认值
const DEFAULT_TIMEOUT = 6000;//默认超时时间(毫秒)
const DEFAULT_SYMBOL_POINT = new SimpleMarkerSymbol();
const DEFAULT_SYMBOL_POLYLINE=new SimpleLineSymbol();
// const DEFAULT_SYMBOL_POLYGON=new SimpleFillSymbol();


class Constants {


    /**
     * 常量定义
     */
    constructor() { }


    //#region 常见地理范围定义

    /**
     * 世界范围:[-180,180,-90,90]
     *
     * @readonly
     * @static
     * @memberof Constants
     */
    static get EXTENT_WORLD() { return EXTENT_WORLD }


    /**
     * 中国近似范围:[73, 3, 136, 54]
     *
     * @static
     * @memberof Constants
     */
    static get EXTENT_CHINA() { return EXTENT_CHINA }
    //#endregion

    //#region 地图缩放层级相关
    /**
     * 最小地图层级：0
     *
     * @static
     * @memberof Constants
     */
    static get MAPLEVEL_MIN() { return MAPLEVEL_MIN }

    /**
     * 最大地图层级：16
     *
     * @static
     * @memberof Constants
     */
    static get MAPLEVEL_MAX() { return MAPLEVEL_MAX }

    /**
     * 全球地图层级：1
     *
     * @static
     * @memberof Constants
     */
    static get MAPLEVEL_GLOBAL() { return MAPLEVEL_GLOBAL }

    /**
     * 国家级地图层级：3
     *
     * @static
     * @memberof Constants
     */
    static get MAPLEVEL_NATION() { return MAPLEVEL_NATION }

    /**
     * 省级地图层级：6
     *
     * @static
     * @memberof Constants
     */
    static get MAPLEVEL_PROVINCE() { return MAPLEVEL_PROVINCE }

    /**
     * 市级地图层级：10
     *
     * @static
     * @memberof Constants
     */
    static get MAPLEVEL_CITY() { return MAPLEVEL_CITY; }

    /**
     * 县级地图层级
     *
     * @static
     * @memberof Constants
     */
    static get MAPLEVEL_COUNTY() { return MAPLEVEL_COUNTY; }

    /**
     * 镇级地图层级：14
     *
     * @static
     * @memberof Constants
     */
    static get MAPLEVEL_TOWN() { return MAPLEVEL_TOWN; }

    /**
     * 街道级地图层级：16
     *
     * @static
     * @memberof Constants
     */
    static get MAPLEVEL_STREET() { return MAPLEVEL_STREET; }

    //#endregion

    //#region 图层相关

    /**
     * 图层类型-影像：0
     *
     * @static
     * @memberof Constants
     */
    static get LAYERTYPE_IMAGERY() { return LAYERTYPE_IMAGERY; }

    /**
     * 图层类型-地形：2
     *
     * @static
     * @memberof Constants
     */
    static get LAYERTYPE_TERRAIN() { return LAYERTYPE_TERRAIN; }

    /**
     * 图层类型-Entity：4
     *
     * @static
     * @memberof Constants
     */
    static get LAYERTYPE_ENTITY() { return LAYERTYPE_ENTITY; }

    /**
     * 图层类型-Primitive：8
     *
     * @static
     * @memberof Constants
     */
    static get LAYERTYPE_PRIMITIVE() { return LAYERTYPE_PRIMITIVE; }
    //#endregion



    //#region 缺省值
    /**
     * 默认超时时间(6000ms)
     *
     * @readonly
     * @static
     * @memberof Constants
     */
    static get DEFAULT_TIMEOUT() {
        return DEFAULT_TIMEOUT;
    }

    /**
     * 缺省点符号(SimpleMarkerSymbol，外观为黑色无边框、大小为10px的实心圆点)
     *
     * @readonly
     * @static
     * @memberof Constants
     */
    static get DEFAULT_SYMBOL_POINT() {
        return DEFAULT_SYMBOL_POINT;
    }



    static get DEFAULT_SYMBOL_POLYLINE()
    {
        return DEFAULT_SYMBOL_POLYLINE;
    }
    //#region 

}











export { Constants } 