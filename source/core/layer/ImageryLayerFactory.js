import { JSHelper } from "../../../libs/JSHelper";
import { ImageryProviderFactory } from "../datasource/imagery/ImageryProviderFactory.js";
import { ImageryLayer } from "./ImageryLayer";
import { LayerGroup } from "./LayerGroup";
import { TileLayer } from "./TileLayer";
// import { WMSLayer } from "./WMSLayer";


class ImageryLayerFactory {

    /**
     * 创建ImageryLayer实例
     *
     * @static
     * @param {Object} [options={}] 配置项
     * @param {String} options.type 影像图类型。受支持的完整type列表：<br>gaode-imagey<br>gaode-street<br>baidu-imagey<br>baidu-street<br>tdt-imagey(不稳定，慎用)<br>arcgis-imagey<br>arcgis-street-purplishBlue<br>superMap-zxyTileImage-world<br>superMap-zxyTileImage<br>tms<br>wms <br>wmts
     * @param {String} [options.id=GUID] 图层id
     * @param {String} [options.name=options.type] 图层名
     * @param {Boolean} [options.correct=undefined] 是否应用纠偏处理。仅对gaode-xxx、baidu-xxx有效
     * @return {ImageryLayer|LayerGroup} 
     * @memberof ImageryLayerFactory
     */
    static Create(options = {}) {
        const type = options.type || "";


        if (!JSHelper.Defined(type))
            throw new Error(`create ImageryLayer failed:type field is required->${type}`);


        if (type.indexOf("offline") > -1) {
            if (!window.SDG_OFFLINE_ASSETS_PATH)
                throw new Error(`create offline imagery layer failed:please config offline imagery path when create map instance`)
        }


        let layer, imageryProvider;

        const correct = typeof (options.correct) === "boolean" ? options.correct : true;
        switch (type) {
            case "wms":
            case "wms-layer":
                layer = new WMSLayer(options);
                break;
            case "tile-layer":
                layer = new TileLayer(options);
                break
            case "gaode-imagery-offline":
                layer = new LayerGroup({
                    id: options.id,
                    name: options.name || type,
                    layers: [
                        new TileLayer({
                            url: `${SDG_OFFLINE_ASSETS_PATH}/tiles/gaode-imagery/world/{z}/{x}/{y}.png`,
                            tileType: "normal",
                            lodMinLevel: 3,
                            lodMaxLevel: 7,
                            correct: correct
                        }),
                        new TileLayer({
                            url: `${SDG_OFFLINE_ASSETS_PATH}/tiles/gaode-imagery/china/{z}/{x}/{y}.png`,
                            tileType: "normal",
                            lodMinLevel: 3,
                            lodMaxLevel: 10,
                            extent: [72, 2, 136, 55],
                            correct: correct
                        })
                    ]
                })
                break;
            case "gaode-street-offline":
                layer = new LayerGroup({
                    id: options.id,
                    name: options.name || type,
                    layers: [
                        new TileLayer({
                            url: `${SDG_OFFLINE_ASSETS_PATH}/tiles/gaode-street/world/{z}/{x}/{y}.png`,
                            tileType: "normal",
                            lodMinLevel: 3,
                            lodMaxLevel: 7,
                            correct: correct
                        }),
                        new TileLayer({
                            url: `${SDG_OFFLINE_ASSETS_PATH}/tiles/gaode-street/china/{z}/{x}/{y}.png`,
                            tileType: "normal",
                            lodMinLevel: 3,
                            lodMaxLevel: 10,
                            extent: [72, 2, 136, 55],
                            correct: correct
                        })
                    ]
                })
                break;



            case "tencent-dark-offline":
                layer = new LayerGroup({
                    id: options.id,
                    name: options.name,
                    layers: [
                        new TileLayer({
                            url: `${SDG_OFFLINE_ASSETS_PATH}/tiles/tencent-dark/world/{z}/{x}/{y}.png`,
                            tileType: "tms",
                            lodMinLevel: 3,
                            lodMaxLevel: 7,
                            correct: correct
                        }),
                        new TileLayer({
                            url: `${SDG_OFFLINE_ASSETS_PATH}/tiles/tencent-dark/china/{z}/{x}/{y}.png`,
                            tileType: "tms",
                            lodMinLevel: 3,
                            lodMaxLevel: 10,
                            extent: [72, 2, 136, 55],
                            correct: correct
                        })
                    ]
                })
                break;
            case "arcgis-imagery-offline":
                options.url = `${SDG_OFFLINE_ASSETS_PATH}/tiles/arcgis-imagery/world/{z}/{x}/{y}.png`;
                options.minimumLevel = 0;
                options.maximumLevel = 7;
                options.imageryProvider = new Cesium.UrlTemplateImageryProvider(options);
                layer = new ImageryLayer(options);
                break;
            default:
                imageryProvider = ImageryProviderFactory.Create(options);
                options.name = options.name || options.type;
                options.imageryProvider = imageryProvider;
                layer = new ImageryLayer(options);
                break;
        }
        return layer;
    }
}
export { ImageryLayerFactory };
