/** 
 * @summary 内置地图组件类型
 * 
 * @enum {String}
 * 
 */
const BuildInWidgetType = {
    /**
    * 主视图按钮
    *
    * @type {String}
    * @constant
    */
    HOME_BUTTON: "home_button",
    /**
    * 缩放按钮
    *
    * @type {String}
    * @constant
    */
    ZOOM_BUTTON: "zoom_button",
    /**
    * 鼠标位置指示器
    *
    * @type {String}
    * @constant
    */
    LOCATION_BAR: "location_bar",
    /**
    * 比例尺
    *
    * @type {String}
    * @constant
    */
    SCALE_BAR: "scale_bar",
    /**
    * 图层树
    *
    * @type {String}
    * @constant
    */
    LAYER_TREE: "layer_tree",
    /**
    * 版权
    *
    * @type {String}
    * @constant
    */
    ATTRIBUTION: "attribution",
    /**
    * 鹰眼
    *
    * @type {String}
    * @constant
    */
    EAGLE_EYE: "eagle_eye",
    /**
    * 场景模式切换
    *
    * @type {String}
    * @constant
    */
    SCENE_MODE_PICKER: "scene_mode_picker",

    /**
    * 菜单
    *
    * @type {String}
    * @constant
    */
    MENU: "menu",


    /**
    * 时间线
    *
    * @type {String}
    * @constant
    */
    TIMELINE: "timeline",

    /**
    * 动画控制
    *
    * @type {String}
    * @constant
    */
    ANIMATION: "animation",
}
Object.freeze(BuildInWidgetType);

export { BuildInWidgetType };