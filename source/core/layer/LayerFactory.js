import { LayerType } from "../base/Constants";
// import { S3MLayer } from "./S3MLayer";
import { Layer } from "./Layer.js"
// import { Tile3DLayer } from "./Tile3DLayer";
// import { WMSLayer } from "./WMSLayer";
// import { WMTSLayer } from "./WMTSLayer";
// import { PointLayer } from "./PointLayer";
import { TileLayer } from "./TileLayer";

// import load from "load-script"
// import { GeoJSONLayer } from "../..";

/**
 *
 *
 * @class LayerFactory
 */
class LayerFactory {

    /**
     * 创建指定类型图层
     *
     * @static
     * @param {String} type 图层类型，可选值：wms_layer、wmts_layer、tile_layer、geojson_layer
     * @param {Object} options 配置项
     * @return {Layer|undefined} 
     * @memberof LayerFactory
     */
    static CreateAsync(type, options) {
        let layer;
        switch (type) {
            case "gaode-street":
                layer = new TileLayer(
                    {
                        url: "https://wprd04.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7",
                    }
                )
                break;
            case "gaode-imagery":
                layer = new TileLayer(
                    {
                        url: "https://wprd04.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=6",
                    }
                )
                break
            case LayerType.TILE_LAYER:
                layer = new TileLayer(options);
                break;
            case LayerType.WFS_LAYER:

                break;
            case LayerType.GEOJSON_LAYER:
                layer = new GeoJSONLayer(options);
                break;
            default:
                //NJLayer
                layer = new TileLayer({ url: type });
                break;
        }
        return layer;
    }
}


export { LayerFactory }

