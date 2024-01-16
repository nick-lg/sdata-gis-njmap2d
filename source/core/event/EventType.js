



/** 
 * @summary 地图事件类型
 * 
 * @enum {String}
 * 
 */
const MapEventType = {
  /**
  * 底图切换
  *
  * @type {String}
  * @constant
  */
  BASEMAP_CHANGED: "basemap_changed",

  /**
  * 图层添加
  *
  * @type {String}
  * @constant
  */
  LAYER_ADDED: "layer_added",

  /**
  * 图层移除
  *
  * @type {String}
  * @constant
  */
  LAYER_REMOVED: "layer_removed",

  /**
  * 场景模式切换前
  *
  * @type {String}
  * @constant
  */
  BEFORE_SCENE_MODE_CHANGING: "before_scene_mode_changing",//场景模式切换前置事件
  /**
  * 场景模式切换
  *
  * @type {String}
  * @constant
  */
  SCENE_MODE_CHANGED: "scene_mode_changed",//场景模式切换事件
  /**
  * 相机变动
  *
  * @type {String}
  * @constant
  */
  CAMERA_CHANGED: "camara_changed",//相机变动事件

  /**
  * 相机移动开始事件
  *
  * @type {String}
  * @constant
  */
  CAMERA_MOVE_START: "camera_move_start",

  /**
  * 相机移动结束事件
  *
  * @type {String}
  * @constant
  */
  CAMERA_MOVE_END: "camera_move_end",



  /**
  * 视点更改
  *
  * @type {String}
  * @constant
  */
  VIEW_POINT_CHANGED: "view_point_changed",//视点更改事件
  /**
  * 视图范围变更
  *
  * @type {String}
  * @constant
  */
  EXTENT_CHANGED: "extent_changed",//地图范围更改事件
  /**
 * 地图层级变动
 *
 * @type {String}
 * @constant
 */
  LEVEL_CHANGED: "level_changed",//地图层级变动事件
  /**
  * 前置渲染
  *
  * @type {String}
  * @constant
  */
  PRE_RENDER: "pre_render",//前置渲染事件 
  /**
  * 后置渲染
  *
  * @type {String}
  * @constant
  */
  POST_RENDER: "post_render",//后置渲染事件
  /**
  * 后置更新
  *
  * @type {String}
  * @constant
  */
  POST_UPDATE: "post_update",


  /**
  * 视图加载完毕
  *
  * @type {String}
  * @constant
  */
  VIEW_LOADED: "VIEW_LOADED",//地图视图初次加载完毕


  /**
  * 时钟推进事件
  *
  * @type {String}
  * @constant
  */
  TICK: "tick",//地图视图初次加载完毕
}
Object.freeze(MapEventType);

/** 
 * @summary 图层事件类型
 * 
 * @enum {String}
 * 
 */
const LayerEventType =
{

  /**
  *  图层添加
  *
  * @type {String}
  * @constant
  */
  ADDED: "added",
  /**
*
* 图层移除 
*
* @type {String}
* @constant
*/
  REMOVED: "removed",


  /**
  *
  * 要素拾取
  *
  * @type {String}
  * @constant
  */
  FEATURE_PICKED: "feature_picked",



  /**
  *
  * 模式切换
  *
  * @type {String}
  * @constant
  */
  SCENE_MODE_CHANGED: "scene_mode_changed"




  //   /**
  //     * 
  //     *
  //     * @type {String}
  //     * @constant
  //     */
  //     CLICK: "click",
  //     DOUBLE_CLICK: "double_click",
  //     MIDDLE_CLICK: "middle_click",
  //     RIGHT_CLICK: "right_click",
  //     MOUSE_MOVE: "mouse_move",
  //     MOUSE_WHEEL: "mouse_wheel",
}
Object.freeze(LayerEventType);





/** 
 * @summary 鼠标事件类型
 * 
 * @enum {String}
 * 
 */
const MouseEventType = {


  /**
  * 鼠标单击
  *
  * @type {String}
  * @constant
  */
  CLICK: "click",//Cesium.ScreenSpaceEventType.LEFT_CLICK

  /**
  * 鼠标双击
  *
  * @type {String}
  * @constant
  */
  DOUBLE_CLICK: "double_click",//Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK

  /**
  * 鼠标中键单击
  *
  * @type {String}
  * @constant
  */
  MIDDLE_CLICK: "middle_click",//Cesium.ScreenSpaceEventType.MIDDLE_CLICK

  /**
  * 鼠标中键按下
  *
  * @type {String}
  * @constant
  */
  MIDDLE_DOWN: "middle_down", //Cesium.ScreenSpaceEventType.MIDDLE_DOWN

  /**
  * 鼠标中键弹起
  *
  * @type {String}
  * @constant
  */
  MIDDLE_UP: "middle_up",//Cesium.ScreenSpaceEventType.MIDDLE_UP

  /**
  * 鼠标右键单击
  *
  * @type {String}
  * @constant
  */
  RIGHT_CLICK: "right_click",//Cesium.ScreenSpaceEventType.RIGHT_CLICK

  /**
  * 鼠标移动
  *
  * @type {String}
  * @constant
  */
  MOUSE_MOVE: "mouse_move", //Cesium.ScreenSpaceEventType.MOUSE_MOVE

  /**
  * 鼠标滚轮滚动
  *
  * @type {String}
  * @constant
  */
  MOUSE_WHEEL: "mouse_wheel",//Cesium.ScreenSpaceEventType.WHEEL
}
Object.freeze(MouseEventType)


/** 
 * @summary 绘制事件类型
 * 
 * @enum {String}
 * 
 */
const DrawEventType = {
  /**
* 绘制挂载
*
* @type {String}
* @constant
*/
  DRAW_MOUNETD: "draw_mouned",
  /**
* 绘制卸载
*
* @type {String}
* @constant
*/
  DRAW_UNMOUNTED: "draw_unmounted",
  /**
* 绘制开始
*
* @type {String}
* @constant
*/
  DRAW_START: "draw_start",
  /**
* 绘制结束
*
* @type {String}
* @constant
*/
  DRAW_COMPLETE: "draw_complete",
}
Object.freeze(DrawEventType)




export { MapEventType, LayerEventType, MouseEventType, DrawEventType }