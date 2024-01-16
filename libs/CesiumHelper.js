import { JSHelper } from "./JSHelper.js";

//---------------test---------------------
//使用数据拟合建立的从Cesium 相机高度至地图层级之间的参数
const LEVEL_CONSTANTS = {
    A: 40487.57,
    B: 0.00007096758,
    C: 91610.74,
    D: -40467.74
};
const defaultParams = {
    globeSurfaceBaseFrag: undefined,//默认surface 片元着色器
}
//---------------test---------------------

class CesiumHelper {

    _viewer;



    _highlightConfig = {
        color: Cesium.Color.GREEN.withAlpha(0.5),
        outlineColor: Cesium.Color.GREEN,
        outlineWidth: 1//线宽
    }




    constructor(viewer, options = {}) {
        this._viewer = viewer;

        if (options.color instanceof Cesium.Color)
            this._highlightConfig.color = options.color

        if (options.outlineColor instanceof Cesium.Color)
            this._highlightConfig.outlineColor = options.outlineColor

        if (JSHelper.IsNumber(options.outlineWidth && options.outlineWidth > 0))
            this._highlightConfig.outlineWidth = options.outlineWidth;
    }

    /**
         * 获取相机高度对应的近似地图层级
         *
         * @static
         * @param {number} cameraHeight 相机高度(m)
         * @returns {number}
         * @memberof CesiumHelper
         */
    static GetLevel(cameraHeight) {
        //-1 是为了和cesium真正的瓦片 this._viewer.scene.globe._surface._debug.maxDepthVisited 一致
        return Math.round(LEVEL_CONSTANTS.D + (LEVEL_CONSTANTS.A - LEVEL_CONSTANTS.D) / (1 + Math.pow(cameraHeight / LEVEL_CONSTANTS.C, LEVEL_CONSTANTS.B))) - 1;
    }


    /**
     * 获取地图层级对应的近似相机高度(m)
     *
     * @static
     * @param {integer} level 地图层级
     * @returns {number}
     * @memberof CesiumHelper
     */
    static GetCameraHeightfromLevel(level, sceneMode) {
        if (sceneMode == 1 || sceneMode == 3) {
            //(老拟合算法)
            //+1 是为了 将level视为cesium瓦片的level，该level比数值拟合level小1
            // level += 1;
            return parseFloat((LEVEL_CONSTANTS.C * Math.pow(Math.abs((LEVEL_CONSTANTS.A - LEVEL_CONSTANTS.D) / (level - LEVEL_CONSTANTS.D) - 1), 1 / LEVEL_CONSTANTS.B)).toFixed(2));
        }
        else if (sceneMode == 2) {
            //新拟合算法(默认相机参数下)
            return [
                40075016.68557849,//for 2 level
                38075016.68557849,
                18575016.685578488,
                4575016.685578488,
                2275016.685578488,
                1075016.6855784878,
                575016.6855784878,
                293016.6855784878,
                145016.6855784878,
                73016.68557848781,
                35016.68557848781,
                17016.685578487813,
                9016.685578487813,
                4576.6855784878135,
                2276.6855784878135,
                1136.6855784878135,
                566.6855784878135,
                276.6855784878135,
                136.68557848781347,//for 20 level
            ][level - 2]

        }
        else
            return Number.NaN;
    }

    /**
     * 高亮对象
     *
     * @static
     * @param {*} object
     * @param {*} [options={ color: Cesium.Color.fromBytes(0, 255, 255, 200) }]
     * @return {*} 
     * @memberof CesiumHelper
     */
    static Highlight(object, options = { color: Cesium.Color.fromBytes(0, 255, 255, 200) }) {

        let color = options.color || this._highlightConfig.color;

        //Entity
        if (object instanceof Cesium.Entity) {
            //通过更改materia or color 属性实现高亮(billboard、label 暂不处理)
            if (!object.uOriginalColor)
                object.uOriginalColor = {};

            let value;
            Object.keys(object).forEach(key => {
                value = object[key];
                if (value) {
                    if (value.hasOwnProperty("_material")) {
                        object.uOriginalColor[key] = value.material;
                        value.material = color;
                    }
                    // //model
                    // else if (value.hasOwnProperty("_silhouetteColor")) {
                    //     object.uOriginalColor[key] = value.silhouetteColor;
                    //     value.silhouetteColor = color;
                    // }
                    else if (value.hasOwnProperty("_color")) {
                        object.uOriginalColor[key] = value.color;
                        value.color = color;
                    }
                }
            })
            //TileSet 不支持
            return true;
        }
        //Primitive、GroundPrimitive
        else if (object instanceof Cesium.Primitive || object instanceof Cesium.GroundPrimitive) {
            if (object.appearance.material) {
                object.uOriginalColor = object.appearance.material;
                let material = Cesium.Material.fromType("Color");
                material.uniforms.color = options.color;
                object.appearance.material = material;
            }
            else {
                //要求geometryInstance 包含id
                if (JSHelper.IsArray(object._instanceIds)) {
                    object.uOriginalColor = {};
                    let arttributes;
                    object._instanceIds.forEach(geometryInstanceID => {
                        arttributes = object.getGeometryInstanceAttributes(geometryInstanceID);
                        object.uOriginalColor[geometryInstanceID] = arttributes.color;
                        arttributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(color);
                    });
                }
                else {
                    console.warn(`can not highlight this Primitive:GroundPrimitive or Primitive with PerInstanceColorAppearance that geometryInstance's id is required`)
                }
            }
            return true;
        }
        //Cesium3DTileFeature、Primitive Model、Point Primitive
        else if (object instanceof Cesium.Cesium3DTileFeature || object instanceof Cesium.Model || object instanceof Cesium.PointPrimitive) {
            object.uOriginalColor = object.color.clone();
            object.color = color;
            return true;
        }
        else {
            console.warn(`highlight unsupported object type:${object}`);
        }
    }


    /**
     * 从高亮对象恢复原色
     *
     * @static
     * @param {*} object
     * @return {*} 
     * @memberof CesiumHelper
     */
    static RecoveryFromHighlighted(object) {
        if (!object.uOriginalColor)
            return;

        //Entity
        if (object instanceof Cesium.Entity) {
            let value;
            Object.keys(object.uOriginalColor).forEach(key => {
                value = object[key];
                if (value) {
                    if (value.hasOwnProperty("_material")) {
                        value.material = object.uOriginalColor[key];
                    }
                    // //model
                    // else if (value.hasOwnProperty("_silhouetteColor")) {
                    //     value.silhouetteColor = object.uOriginalColor[key];
                    // }
                    else if (value.hasOwnProperty("_color")) {
                        value.color = object.uOriginalColor[key];
                    }
                }
            })
        }
        //Primitive、GroundPrimitive
        else if (object instanceof Cesium.Primitive || object instanceof Cesium.GroundPrimitive) {
            if (object.appearance.material) {
                object.appearance.material = object.uOriginalColor;
            }
            else {
                //PerInstanceColorAppearance,要求Primitive.geometryInstance 在创建时指定id
                if (JSHelper.IsArray(object._instanceIds)) {
                    let arttributes;
                    object._instanceIds.forEach(geometryInstanceID => {
                        arttributes = object.getGeometryInstanceAttributes(geometryInstanceID);
                        arttributes.color = object.uOriginalColor[geometryInstanceID]
                    });
                }
                else {
                    console.warn(`can not highlight this Primitive:GroundPrimitive or Primitive with PerInstanceColorAppearance that geometryInstance's id is required`)
                }
            }
        }
        //Point Primitive、 Model Primitive
        else if (object instanceof Cesium.PointPrimitive || object instanceof Cesium.Model) {
            object.color = object.uOriginalColor;
        }
        //Cesium3DTileFeature
        else if (object instanceof Cesium.Cesium3DTileFeature) {
            object.color = object.uOriginalColor;//必须刷新引用，直接修改无效
        }
        else {
            console.warn(`highlight unsupported  object type:${object}`);
        }
    }




    /**
     * 将Rectangel转换为Extent
     *
     * @static
     * @param {Cesium.Rectangle} rectangle
     * @return {Array<Number>} 
     * @memberof CesiumHelper
     */
    static RectangleToExtent(rectangle) {
        if (!(rectangle instanceof Cesium.Rectangle))
            return;
        return [
            rectangle.west * 180 / Math.PI,
            rectangle.south * 180 / Math.PI,
            rectangle.east * 180 / Math.PI,
            rectangle.north * 180 / Math.PI];
    }


    /**
     * 将Extent转换为Rectangle
     *
     * @static
     * @param {Array<Number>} extent
     * @return {Cesium.Rectangle} 
     * @memberof CesiumHelper
     */
    static ExtentToRectangle(extent) {
        return Cesium.Rectangle.fromDegrees(...extent);
    }


    /**
     * 将WGS84坐标转换为屏幕坐标
     *
     * @static
     * @param {Cesium.Viewer} viewer
     * @param {Cesium.Cartesian2} cartesian2
     * @param {Cesium.Cartesian2} result
     * @return {Cesium.Cartesian2} 
     * @memberof CesiumHelper
     */
    static WGS84ToWindow(viewer, cartesian2, result) {
        return Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian2, result);
    }

    /**
     * 将屏幕坐标转换为WGS84坐标(球面坐标)
     *
     * @static
     * @param {*} viewer
     * @param {*} cartesian2
     * @return {*} 
     * @memberof CesiumHelper
     */
    static WindowToWGS84(viewer, cartesian2) {
        // let result;
        // if (viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
        //     let ray = viewer.scene.camera.getPickRay(cartesian2)//不稳定
        //     result = viewer.scene.globe.pick(ray, viewer.scene)
        // } else {
        //     result = viewer.scene.camera.pickEllipsoid(cartesian2, Cesium.Ellipsoid.WGS84, result)
        // }


        // let position = new Cesium.Cartesian2(this.viewer.scene.canvas.width / 2, this.viewer.scene.canvas.height / 2);
        // //获取地形表面(仅3D+有效地形) or 椭球面处的位置(忽略地物)
        // if (this._viewer.scene.mode === Cesium.SceneMode.SCENE3D && !(this._viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider)) {
        //     //3D模式 + 叠加地形
        //     let ray = this.viewer.camera.getPickRay(position);
        //     if (!ray)
        //         return undefined;
        //     position = this._viewer.scene.globe.pick(ray, this._viewer.scene);
        // }
        // else {
        //     //其他(忽略地形+地物，此时转换后海拔高度始终是0，即拿到的是椭球面位置)
        //     position = this._viewer.scene.camera.pickEllipsoid(
        //         position,
        //         Cesium.Ellipsoid.WGS84,
        //     )
        // }

        // if (!position)
        //     return undefined;


        // position = Cesium.Cartographic.fromCartesian(position);
        // return [
        //     position.longitude * Cesium.Math.DEGREES_PER_RADIAN,
        //     position.latitude * Cesium.Math.DEGREES_PER_RADIAN,
        //     position.height
        // ]


        return viewer.scene.camera.pickEllipsoid(cartesian2, Cesium.Ellipsoid.WGS84);
    }

    static RgbaToCesiumColor(rgba) {
        return Cesium.Color.fromBytes(rgba[0], rgba[1], rgba[2], typeof rgba[3] == "number" ? Math.trunc(rgba[3] * 255) : 255)
    }



    /**
     * 将 Date or Iso8601字符串转化为Cesium儒略时间
     *
     * @static
     * @param {Date|String|Cesium.JulianDate} value
     * @return {Cesium.JulianDate|undefined} 
     * @memberof CesiumHelper
     */
    static ToCesiumTime(value) {
        if (value instanceof Cesium.JulianDate) {
            return value
        }
        else if (value instanceof Date) {
            return Cesium.JulianDate.fromDate(value);
        }
        else if (typeof value == "string" && value.length > 0) {
            return Cesium.JulianDate.fromIso8601(value);
        }
        else {
            return undefined;
        }
    }

    /**
   * 自定义球面后处理
   *
   * @static
   * @param {Cesium.Globe} globe 球体对象
   * @param {string} [colorFuncString = undefined ] GLSL 颜色修改函数,若为无效GLSL函数字符，则使用默认的着色器
   * @returns {boolean} 是否设置成功
   * @memberof CesiumHelper
   * 
   * @example <caption>将底图设置为灰度图效果</caption>
   * 
   * //定义GLSL颜色修改函数
   * let colorFunction=`vec4 customFinalColorFunc(vec4 color)
   *     {
   *         //灰度图效果
   * 
   *         float avenue=(color.r+color.g+color.b)/3.0;
   *         color.r=avenue;
   *         color.g=avenue;
   *         color.b=avenue;
   *         return color;
   *     }`
   * 
   * //设置自定义颜色修改函数
   * CesiumHelper.SetGlobeSurfaceColorFunc(map.viewer.scene.globe,colorFunction);
   * 
   * //刷新地图
   * map.refesh();
   */
    static SetGlobeSurfacePostProcess(globe, colorFuncString) {
        /**
         * 总结：底图颜色的修改
         * 
         * 本质上是修改球面颜色的片元着色器
         * 球面颜色的片元着色器在GlobeFS.glsl中，这里面内嵌了很多define条件 供 imagery、地形等对象启用
         * 调用者是 globe._surface._tileProvider._surfaceShaderSet.baseFragmentShaderSource，里面嵌入了多个sources源码
         * baseFragmentShaderSource.sources中有多套片元着色器，其中只有一个主着色器(包含 void main)
         * 
         */

        let success = false
        if (!(globe instanceof Cesium.Globe)) {
            return success;
        }



        //找出最后赋值gl_FragColor语句 替换成 colorFunctionName
        let surfaceFragmentSource = globe._surface._tileProvider._surfaceShaderSet.baseFragmentShaderSource;
        let fragSource;
        for (let i = 0; i < surfaceFragmentSource.sources.length; i++) {
            fragSource = surfaceFragmentSource.sources[i];
            let mainIndex = fragSource.indexOf("void main");
            if (mainIndex > -1) {
                //保存默认着色器以备还原
                if (!defaultParams.globeSurfaceBaseFrag) {
                    defaultParams.globeSurfaceBaseFrag = fragSource;
                }

                //无效GLSL颜色函数将还原到默认着色器
                if (typeof (colorFuncString) != "string" || colorFuncString.indexOf("vec4") == -1) {
                    surfaceFragmentSource.sources[i] = defaultParams.globeSurfaceBaseFrag;
                    success = true;
                    return success;
                }

                //提取出函数名
                let colorFunctionName = colorFuncString.slice(colorFuncString.indexOf("vec4 ") + 5, colorFuncString.indexOf("("));

                //若函数重复设置,则先还原到默认函数，再行替换
                if (fragSource.indexOf(colorFunctionName) > -1) {
                    fragSource = defaultParams.globeSurfaceBaseFrag;

                    //重新计算mainIndex
                    mainIndex = fragSource.indexOf("void main");
                }

                //step1:在void main 之前增加函数声明
                let finalSource = `${fragSource.slice(0, mainIndex)}\n ${colorFuncString}\n  ${fragSource.slice(mainIndex)}`;

                //step2:替换gl_FragColor=finalColor;  基于1.76版本测试，其他版本可能有变化
                surfaceFragmentSource.sources[i] = finalSource.replace("gl_FragColor = finalColor", `gl_FragColor = ${colorFunctionName}(finalColor)`);

                success = true;

                //有且只有一个source包含main
                break;
            }
        }

        return success;
    }


    static SetEffect(viewer, styleID) {
        let params = {
            hue: Cesium.ImageryLayer.DEFAULT_HUE,
            saturation: Cesium.ImageryLayer.DEFAULT_SATURATION,
            brightness: Cesium.ImageryLayer.DEFAULT_BRIGHTNESS,
            contrast: Cesium.ImageryLayer.DEFAULT_CONTRAST,
            gamma: Cesium.ImageryLayer.DEFAULT_GAMMA + Math.random() + 0.00001//实验发现params不能和默认值完全一样，否则地图级别较小时自定义着色器不执行
        }

        let colorFunc;
        switch (styleID) {
            case "midnight-gray":
                params = {
                    hue: 1.0,
                    saturation: 0.0,
                    brightness: 0.6,
                    contrast: 1.8,
                    gamma: 0.3
                };
                colorFunc = `vec4 customFinalColorFunc(vec4 color)
                {
                    color.rgb=(vec3(1.0)-color.rgb)*vec3(78.0/255.0,112.0/255.0,116.0/255.0);
                    return color;
                }`
                break;
            case "gray":
                colorFunc = `vec4 customFinalColorFunc(vec4 color)
                {
                    float avenue=(color.r+color.g+color.b)/3.0;
                    color.r=avenue;
                    color.g=avenue;
                    color.b=avenue;
                    return color;
                }`
                break;
            default:
                break;
        }

        viewer.imageryLayers._layers.forEach((item, index) => {
            if (index < 1) {
                item.hue = params.hue;
                item.saturation = params.saturation;
                item.brightness = params.brightness;
                item.contrast = params.contrast;
                item.gamma = params.gamma;
            }
        })
        CesiumHelper.SetGlobeSurfacePostProcess(viewer.scene.globe, colorFunc);
    }

    /**
    * 构建场景回放
    *
    * @param {Object} options 回放构建配置项
    * @param {Cesium.Entity} 回放目标
    * @param {Array} options.dataSource 数据序列
    * @param {String} options.idField 主键字段
    * @param {String} options.timeField 时间字段
    * @param {String} options.positionField 位置字段
    * @param {String} options.angleField 角度字段
    * @param {Boolean} options.smoothRender 是否平滑渲染
    * @memberof PlaneLayer
    */
    static BuildEntityPlayback(options) {
        const target = options.target;
        if (!(target instanceof Cesium.Entity)) {
            console.warn(`build playback failed:Now only Entity supports building playback`);
            return;
        }

        if (!JSHelper.IsArray(options.dataSource) || options.dataSource.length < 2)
            return;

        const dataSource = options.dataSource;
        const timeField = options.timeField || "time";        //时间戳字段
        const outputFields = options.outputFields || [];//挂载到Entity上的字段
        const positionField = options.positionField || "position";
        const angleField = options.angleField || "rotation";
        const smoothRender = options.smoothRender || false; //是否平滑渲染

        let dataItem, time, timeType;
        timeType = dataSource[0][timeField] instanceof Date ? 0 : 1;


        for (let i = 0; i < dataSource.length; i++) {
            dataItem = dataSource[i];
            time = timeType == 0 ? Cesium.JulianDate.fromDate(dataItem[timeField]) : Cesium.JulianDate.fromIso8601(dataItem[timeField]);
            if (i == 0) {
                //----属性设置
                if (!target.properties)
                    target.properties = {}
                for (let i = 0; i < outputFields.length; i++) {
                    const field = outputFields[i];
                    target.properties[field] = dataItem[field];
                }


                //----动画
                target.availability = new Cesium.TimeIntervalCollection([
                    new Cesium.TimeInterval({
                        start: time,
                        stop: Cesium.JulianDate.fromIso8601("9999-01-01T00:00:00Z"),
                        isStartIncluded: true,
                        isStopIncluded: !smoothRender
                    })
                ])

                //位置动画
                if (smoothRender) {
                    target.position = new Cesium.SampledPositionProperty();
                    target.position.addSample(time, Cesium.Cartesian3.fromDegrees(...dataItem[positionField]));
                }
                else {
                    target.position = new Cesium.TimeIntervalCollectionProperty();

                    target.uTime = Cesium.JulianDate.toIso8601(time);//更新最新数据时间
                    target.availability._intervals[0].stop = time;
                }

                //图标动画
                if (target.billboard) {
                    if (JSHelper.IsNumber(dataItem[angleField])) {
                        if (smoothRender) {
                            target.billboard.rotation = new Cesium.SampledProperty(Number);
                            target.billboard.rotation.addSample(time, -dataItem[angleField] + Math.PI / 2);
                        }
                        else {
                            target.billboard.rotation = new Cesium.TimeIntervalCollectionProperty();
                        }
                    }
                }
            }
            else {
                if (smoothRender) {
                    target.position.addSample(time, Cesium.Cartesian3.fromDegrees(...dataItem[positionField]));
                    if (target.billboard) {
                        if (JSHelper.IsNumber(dataItem[angleField]))
                            target.billboard.rotation.addSample(time, -dataItem[angleField] + Math.PI / 2);
                    }
                }
                else {
                    dataItem = dataSource[i - 1];
                    target.position.intervals.addInterval(Cesium.TimeInterval.fromIso8601({
                        iso8601: `${target.uTime}/${Cesium.JulianDate.toIso8601(time)}`,
                        isStartIncluded: true,
                        isStopIncluded: true,
                        data: Cesium.Cartesian3.fromDegrees(...dataItem[positionField])
                    }));
                    if (target.billboard) {
                        if (JSHelper.IsNumber(dataItem[angleField]))
                            target.billboard.rotation.intervals.addInterval(Cesium.TimeInterval.fromIso8601({
                                iso8601: `${target.uTime}/${Cesium.JulianDate.toIso8601(time)}`,
                                isStartIncluded: true,
                                isStopIncluded: true,
                                data: -dataItem[angleField] + Math.PI / 2
                            }))
                    }
                    target.uTime = Cesium.JulianDate.toIso8601(time);//更新最新数据时间

                    //最后时刻数据补充时间段
                    if (i == dataSource.length - 1) {
                        dataItem = dataSource[i];
                        target.position.intervals.addInterval(Cesium.TimeInterval.fromIso8601({
                            iso8601: `${target.uTime}/9999-01-01T00:00:00Z`,
                            isStartIncluded: true,
                            isStopIncluded: true,
                            data: Cesium.Cartesian3.fromDegrees(...dataItem[positionField])
                        }))
                        if (target.billboard) {
                            if (JSHelper.IsNumber(dataItem[angleField]))
                                target.billboard.rotation.intervals.addInterval(Cesium.TimeInterval.fromIso8601({
                                    iso8601: `${target.uTime}/9999-01-01T00:00:00Z`,
                                    isStartIncluded: true,
                                    isStopIncluded: true,
                                    data: -dataItem[angleField] + Math.PI / 2
                                }))
                        }
                    }
                }
                target.availability._intervals[0].stop = time;
            }
        }
    }

    static Densify(path, threshold = 1) {
        if (!Array.isArray(path))
            return undefined

        let sp, ep, pstep, t, p = [0, 0, 0], hasZ = Boolean(path[0].length > 2), span, count1, count2, count, results = [];
        for (let i = 0; i < path.length - 1; i++) {
            count = 0;
            sp = path[i];
            ep = path[i + 1];

            span = Math.abs(sp[0] - ep[0])
            if (span > threshold) {
                count1 = Math.ceil(span / threshold);
                count = count1;
            }
            span = Math.abs(sp[1] - ep[1])
            if (span > threshold) {
                count2 = Math.ceil(span / threshold);
                if (count2 > count1)
                    count = count2
            }

            if (count > 0) {
                pstep = [(ep[0] - sp[0]) / (count+1), (ep[1] - sp[1]) / (count+1), hasZ ? (ep[2] - sp[2]) / (count+1) : 0]
                for (let j = 1; j <= count; j++) {
                    p[0] = sp[0] + pstep[0] * j;
                    p[1] = sp[1] + pstep[1] * j;
                    if (hasZ)
                        p[2] = sp[2] + pstep[2] * j;
                    results.push([...p]);
                }
            }
            else {
                results.push(sp);
            }
        }
        results.push(ep);

        return results;
    }

}

export { CesiumHelper }