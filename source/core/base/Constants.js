//静态资源

import icon_location from "../../assets/image/location.png"



//常见地域经纬度范围预定义
const WORDL_EXTENT = [-180, -90, 180, 90];
Object.freeze(WORDL_EXTENT);

const PreDefinedExtent = {
  WORDL_EXTENT: WORDL_EXTENT,//世界范围
  CHINA: [73.55, 3.85, 135.09, 53.55],
  BEIJING: [115.430282, 39.445587, 117.513171, 41.066884],//北京
  SHANGHAI: [120.862372, 30.676443, 122.006022, 31.8733],//上海
  NANJING: [118.369429, 31.235331, 119.247036, 32.618713],//南京

  JIANGSU: [116.36856, 30.764191, 122.005714, 35.128722],//江苏

}
Object.freeze(PreDefinedExtent);



/** 
 * @summary 图层类型
 * 
 * @enum {String}
 * 
 */
const LayerType = {
  /**
  * 图层组
  *
  * @type {String}
  * @constant
  */
  LAYER_GROUP: "layer_group",
  /**
  * 影像图层
  *
  * @type {String}
  * @constant
  */
  IMAGERY_LAYER: "imagery_layer",
  /**
  * 瓦片图层
  *
  * @type {String}
  * @constant
  */
  TILE_LAYER: "tile_layer",


  /**
  * WMTS图层
  *
  * @type {String}
  * @constant
  */
  WMTS_LAYER: "wmts_layer",


  /**
  * MVT瓦片图层
  *
  * @type {String}
  * @constant
  */
  VECTOR_TILE_LAYER: "vector_tile_layer",

  /**
  * 矢量图层
  *
  * @type {String}
  * @constant
  */
  VECTOR_LAYER: "vector_layer",



  /**
  * WMS图层
  *
  * @type {String}
  * @constant
  */
  WMS_LAYER: "wms_layer",


  /**
  * WMS图层
  *
  * @type {String}
  * @constant
  */
  WFS_LAYER: "wfs_layer",



  TERRAIN_LAYER: "terrain_layer",


  /**
  * GeoJSON图层
  *
  * @type {String}
  * @constant
  */
  GEOJSON_LAYER: "geojson_layer",




  /**
  * 3DTiles图层
  *
  * @type {String}
  * @constant
  */
  TILE3D_LAYER: "tile_3d_layer",

  /**
  * 超图S3M服务图层
  *
  * @type {String}
  * @constant
  */
  S3M_LAYER: "s3m_layer",

  /**
    * 实体图层
    *
    * @type {String}
    * @constant
    */
  ENTITY_LAYER: "entity_layer",

  /**
  * 点实体图层
  *
  * @type {String}
  * @constant
  */
  POINT_ENTITY_LAYER: "point_entity_layer",


  /**
  * 点图层
  *
  * @type {String}
  * @constant
  */
  POINT_LAYER: "point_layer",

  /**
  * Primitive图层
  *
  * @type {String}
  * @constant
  */
  PRIMITIVE_LAYER: "primitive_layer",


  /**
  * 热力图图层
  *
  * @type {String}
  * @constant
  */
  HEAT_MAP_LAYER: "heat_map_layer"
}
Object.freeze(LayerType)


const MapSourceTypes = [
  "gaode-imagery",
  "gaode-street",
  "baidu-imagery",
  "baidu-street",
  "tdt-imagery",
  "arcgis-imagery",
  "arcgis-street-purplishBlue",
  "superMap-zxyTileImage-world",
  "gaode-imagery-offline",
  "gaode-imagery-beijing-offline",
  "gaode-street-offline",
  "gaode-street-beijing-offline",
  "baidu-street-offline",
  "arcgis-imagery-offline",
]





//目标(地物)类型
const TargetType = {
  FEATURE: "feature",
  ENTITY: "entity",
  ENTITIES: "entities",
  PRIMITIVE: "primitive",
  GROUND_PRIMITIVE: "ground_primitive",
  MODEL_PRIMITIVE: "model_primitive",
  POINT_PRIMITIVE: "point_primitive",
  CESIUM_3DTILE_FEATURE: "cesium_3dtile_feature",
  IMAGERY_LAYER_FEATURE_INFO: "imagery_layer_feature_info"
}
Object.freeze(TargetType);

//状态类型
const EnumState = {
  INITIALIZED: 'initialized',
  ADDED: 'added',
  REMOVED: 'removed',
  CLEARED: 'cleared',
  INSTALLED: 'installed',
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  PLAY: 'play',
  PAUSE: 'pause',
  RESTORE: 'restore'
}
Object.freeze(EnumState);


/** 
 * @summary 绘制类型
 * 
 * @enum {String}
 * 
 */
const DrawType = {
  /**
  *  点
  *
  * @type {String}
  * @constant
  */
  POINT: "point",

  /**
  *  多段线
  *
  * @type {String}
  * @constant
  */
  POLYLINE: "polyline",

  /**
  *  多边形
  *
  * @type {String}
  * @constant
  */
  POLYGON: "polygon",

  /**
  *  矩形
  *
  * @type {String}
  * @constant
  */
  RECTANGLE: "rectangle",

  /**
  *  圆
  *
  * @type {String}
  * @constant
  */
  CIRCLE: "circle",

  /**
  *  直箭头
  *
  * @type {String}
  * @constant
  */
  STRAIGHT_ARROW: "straight_arrow",

  /**
  *  燕尾直箭头
  *
  * @type {String}
  * @constant
  */
  TAILED_SHARP_STRAIGHT_ARROW: "tailed_sharp_straight_arrow",

  /**
   *  聚集地
   *
   * @type {String}
   * @constant
   */
  GATHER_SPOT: "gather_spot",

  /**
   *  文字
   *
   * @type {String}
   * @constant
   */
  TEXT: "text"
}
Object.freeze(DrawType);


/** 
 * @summary 测量类型
 * 
 * @enum {String}
 * 
 */
const MeasureType = {
  /**
  *  距离测量
  *
  * @type {String}
  * @constant
  */
  DISTANCE: "distance",

  /**
  *  面积测量
  *
  * @type {String}
  * @constant
  */
  AREA: "area",
}
Object.freeze(MeasureType);

/** 
 * @summary 符号类型
 * 
 * @enum {String}
 * 
 */
const SymbolType = {
  SIMPLE_MARKER: "simple-marker",
  PICTURE_MARKER: "picture-marker",
  TEXT_MARKER: "text-marker",
  MESH: "mesh-3d",
}
Object.freeze(SymbolType);




//默认标绘样式
const DEFAULT_PLOT_STYLE = {
  point: {
    type: "simple-marker",
    size: 12,
    color: [255, 0, 0, 1],
  },



  polyline: {
    // color: [252, 128, 70, 1],
    color: [255, 0, 0, 1],
    width: 2,
  },
  polygon: {
    // color: [255, 255, 0, 0.2],
    color: [255, 0, 0, 1],
    outlineColor: [245, 122, 122, 1],
    outlineWidth: 2
  },
  anchor: {
    size: 8,
    // color: [245, 122, 122, 1],
    // outlineColor: [255, 255, 255, 1],
    color: [255, 255, 255, 1],
    outlineColor: [255, 0, 0, 1],
    outlineWidth: 2
  },
  measurement: {
    decimals: 2,
    font: "10px sans-serif",
    color: [136, 136, 136, 1],
    backgroundColor: [255, 255, 255, 1],
    pixelOffset: [0, -32]
  },

  text: {
    text: "",
    font: "16px sans-serif",
    color: [255, 0, 0, 1],
    showBackground: true,
    backgroundColor: [0, 0, 0, 0],
    xOffset: 0,
    yOffset: 0,
    horizontalOrigin: 0,
    verticalOrigin: 0
  },
}
Object.freeze(DEFAULT_PLOT_STYLE);


const LOCATION_SYMBOL = {
  type: "picture-marker",
  image: icon_location,
  width: 32,
  height: 32,
  xOffset: 0,
  yOffset: 0
}



const DefaultHighLightConfig = {
  color: [0, 255, 0, 1],
  width: 0.01,
}


const TOKENS = {
  MAP_BOX_ACCESS_TOKEN: "pk.eyJ1Ijoibmljay1sZyIsImEiOiJja2pzNnJ2bWcwMnVqMzBxeDQyM2I2OW43In0.xXHfMTZlWvyMAS8pzhUrtg"
}





export { PreDefinedExtent, EnumState, LayerType, MapSourceTypes, TargetType, DrawType, MeasureType, SymbolType, DEFAULT_PLOT_STYLE, LOCATION_SYMBOL, DefaultHighLightConfig, TOKENS }