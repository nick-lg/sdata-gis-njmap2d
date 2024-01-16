import { JSHelper } from "../../../libs/JSHelper.js";
import { CustomPrimitve } from "./CustomPrimitve.js";
import h337 from "../../../libs/heatmap.js"



class HeatMapPrimitive extends CustomPrimitve {
    #extent;
    #canvasSize;
    #xyvFields;
    #baseSize;//画布基础尺寸

    #minOpacity;
    #maxOpacity;
    #minHeight;
    #maxHeight;
    #blur;
    #gradiant;



    /**
     * 热力图覆盖的地理范围
     *
     * @readonly
     * @memberof HeatMapPrimitive
     */
    get extent() {
        return this.#extent;
    }


    /**
     * 数据点字段映射
     *
     * @readonly
     * @memberof HeatMapPrimitive
     */
    get xyvFields() {
        return this.xyvFields;
    }


    /**
     * 热力图Primitive
     * @param {Cesium.Viewer} viewer
     * @param {Object} options
     * @ignore
     * @constructor
     */
    constructor(viewer, options) {
        super(viewer, options);

        this.#xyvFields = options.xyvFields || {
            x: "x",
            y: "y",
            v: "value"
        }
        this.#baseSize = options.baseSize || 256
        this.#minHeight = options.minHeight || 0;
        this.#maxHeight = options.maxHeight || 3000;
        this.#minOpacity = options.minOpacity || 0;
        this.#maxOpacity = options.maxOpacity || 0.8;
        this.#blur = options.blur || 0.85;
        this.#gradiant = options.gradiant
        this.setData(options.data);
    }


    /**
     * 设定热力图数据源
     *
     * @param {*} data
     * @return {*} 
     * @memberof HeatMapPrimitive
     */
    setData(data) {
        let result;
        if (JSHelper.IsArray(data)) {
            result = this.getImageDatas(data);
        }
        else if (data?.imageData) {
            result = data;
        }
        else
            return;

        if (this.appearance) {
            this.appearance.uniforms.u_samper2D_color.copyFrom({
                source: {
                    width: this.#canvasSize[0],
                    height: this.#canvasSize[1],
                    arrayBufferView: result.imageData.data
                }
            }
            );
        }
        else {
            this.geometryInstances = this.#createGeometryInstance(this.#extent);
            this.appearance = this.#createAppearance(result);
        }
        return result;
    }

    getImageDatas(dataPoints) {
        if (!Array.isArray(dataPoints)) {
            console.error(`array type required`);
            return;
        }

        if (dataPoints.length == 0) {
            console.warn("empty data points");
            return;
        }

        let xyvFields = this.#xyvFields;
        if (!(dataPoints[0][xyvFields.x] && dataPoints[0][xyvFields.y] && dataPoints[0][xyvFields.v])) {
            console.error(`invalid data point`);
            return;
        }

        console.time(`create ${dataPoints.length} dataPoints' heatmap instance`);


        //----计算坐标范围并映射----
        let spanX, spanY;
        if (!this.#extent) {
            let tempPoint = dataPoints[0];
            let minX = tempPoint[xyvFields.x];
            let minY = tempPoint[xyvFields.y];
            let maxX = tempPoint[xyvFields.x];
            let maxY = tempPoint[xyvFields.y];;

            for (let i = 0; i < dataPoints.length; i++) {
                tempPoint = dataPoints[i];

                if (tempPoint[xyvFields.x] < minX)
                    minX = tempPoint[xyvFields.x];
                if (tempPoint[xyvFields.y] < minY)
                    minY = tempPoint[xyvFields.y];
                if (tempPoint[xyvFields.x] > maxX)
                    maxX = tempPoint[xyvFields.x];
                if (tempPoint[xyvFields.y] > maxY)
                    maxY = tempPoint[xyvFields.y];
            }
            this.#extent = [minX, minY, maxX, maxY];
            spanX = this.#extent[2] - this.#extent[0];
            spanY = this.#extent[3] - this.#extent[1];
            let ratio = Math.min(spanX, spanY) / Math.max(spanX, spanY);
            let canvasWidth, canvasHeight;
            if (spanX < spanY) {
                canvasHeight = this.#baseSize;
                canvasWidth = Math.ceil(this.#baseSize * ratio);
            }
            else {
                canvasWidth = this.#baseSize;
                canvasHeight = Math.ceil(this.#baseSize * ratio);
            }
            if (!this.radius) {
                this.radius = Math.ceil(Math.max(2, Math.min(canvasWidth, canvasHeight) * 0.05));
            }
            let dx = this.radius / canvasWidth * spanX;
            let dy = this.radius / canvasHeight * spanY;
            this.#extent = [minX - dx, minY - dy, maxX + dx, maxY + dy];
            this.#canvasSize = [canvasWidth + 2 * this.radius, canvasHeight + 2 * this.radius];
        }

        spanX = this.#extent[2] - this.#extent[0];
        spanY = this.#extent[3] - this.#extent[1];



        let mappedDataPoints = new Array(dataPoints.length);
        let tempPoint;
        for (let i = 0; i < dataPoints.length; i++) {
            tempPoint = dataPoints[i];
            mappedDataPoints[i] = {
                x: Math.floor((tempPoint[xyvFields.x] - this.#extent[0]) * this.#canvasSize[0] / spanX),
                y: Math.floor((-tempPoint[xyvFields.y] + this.#extent[3]) * this.#canvasSize[1] / spanY),
                value: tempPoint[xyvFields.v]
            }
        }
        if (typeof (this.minValue) != "number" || typeof (this.maxValue) != "number") {
            this.minValue = this.maxValue = 0;
            for (let i = 0; i < dataPoints.length; i++) {
                tempPoint = dataPoints[i];

                if (tempPoint[xyvFields.v] < this.minValue)
                    this.minValue = tempPoint[xyvFields.v];
                if (tempPoint[xyvFields.v] > this.maxValue)
                    this.maxValue = tempPoint[xyvFields.v];
            }
        }
        // if (!this.radius) {
        //     this.radius = Math.max(1, Math.min(this.#canvasSize[0], this.#canvasSize[1]) * 0.05);
        // }

        let canvas = document.createElement("canvas");
        canvas.width = this.#canvasSize[0];
        canvas.height = this.#canvasSize[1];
        let heatmapInstance = h337.create(
            {
                canvas: canvas,
                radius: this.radius,
                maxOpacity: this.#maxOpacity,
                minOpacity: this.#minOpacity,
                blur: this.#blur,
                // gradient: {
                //     // enter n keys between 0 and 1 here
                //     // for gradient color customization
                //     '.5': 'green',
                //     '.8': 'yellow',
                //     '.95': 'red'
                // }
                gradient: this.#gradiant
            }
        );

        let data = {
            min: this.minValue,//默认0
            max: this.maxValue,//默认100
            data: mappedDataPoints
        };
        heatmapInstance.setData(data);
        console.timeEnd(`create ${dataPoints.length} dataPoints' heatmap instance`);


        return {
            imageData: heatmapInstance._renderer.ctx.getImageData(0, 0, this.#canvasSize[0], this.#canvasSize[1]),
            imageData2: heatmapInstance._renderer.shadowCtx.getImageData(0, 0, this.#canvasSize[0], this.#canvasSize[1]),
        }
    }

    #createGeometryInstance(extent) {
        let geometry = new Cesium.RectangleGeometry({
            rectangle: Cesium.Rectangle.fromDegrees(...extent),
            vertexFormat: Cesium.VertexFormat.POSITION_AND_ST
        })
        let geometryInstance = new Cesium.GeometryInstance({
            geometry: geometry,
        })
        return geometryInstance;
    }
    #createAppearance(imageDatas) {
        let appearance = new Cesium.Appearance({
            flat: true,//对着色器影响很大：true时少false时多
            translucent: true,
            vertexShaderSource: this.#getVertexShaderSource(),
            fragmentShaderSource: this.#getFragShaderSource(),
            renderState: {
                cull: {
                    enabled: true,
                    face: Cesium.WebGLConstants.BACK,
                }
            }
        });

        appearance.uniforms = {
            u_samper2D_color: new Cesium.Texture(
                {
                    context: this.context,
                    width: this.#canvasSize[0],
                    height: this.#canvasSize[1],
                    source:
                    {
                        arrayBufferView: imageDatas.imageData.data
                    },
                    pixelFormat: Cesium.PixelFormat.RGBA,//颜色格式
                    pixelDatatype: Cesium.UNSIGNED_BYTE,
                    sampler: new Cesium.Sampler(
                        {
                            minificationFilter: Cesium.TextureMagnificationFilter.NEAREST,
                            magnificationFilter: Cesium.TextureMagnificationFilter.LINEAR
                        })
                }),
        }
        return appearance;
    }

    #getVertexShaderSource() {
        return `
        attribute vec3 position3DHigh;
        attribute vec3 position3DLow;
        attribute float batchId;
        attribute vec2 st;
        varying vec2 v_st;
        void main() {
            vec4 p = czm_computePosition();
            gl_Position = czm_modelViewProjectionRelativeToEye * p;
            v_st=st;
    }`;
    }

    #getFragShaderSource() {
        return `precision highp float;
    varying vec4 v_color;
    varying vec2 v_st;
    uniform sampler2D u_samper2D_color;
    void main()
    {
        vec4 color= texture2D(u_samper2D_color,v_st);
        gl_FragColor=color;
    }`
    }
}
export { HeatMapPrimitive }