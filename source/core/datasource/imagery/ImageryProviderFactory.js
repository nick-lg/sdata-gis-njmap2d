import { JSHelper } from "./.././../../../libs/JSHelper.js";
import AmapImageryProvider from "./amap/AmapImageryProvider.js";
import AmapMercatorTilingScheme from "./amap/AmapMercatorTilingScheme.js";
import BaiduImageryProvider from "./baidu/BaiduImageryProvider.js";

const defaultOptions = {
    token_tdt: "17171edadb4d4cfa1e045bf4742cbc43",
}
const cache = {}

class ImageryProviderFactory {
    static Create(options = {}) {
        let _options = Object.assign({}, options);
        const type = _options.type || "";
        const correct = JSHelper.IsBoolean(_options.correct) ? options.correct : true;
        switch (type) {
            //----------------------------高德地图-------------------------------------

            case "gaode-imagery":
                _options.crs = correct ? "WGS84" : undefined;
                _options.style = "img"
                return new AmapImageryProvider(_options);
            case "gaode-street":
                _options.crs = correct ? "WGS84" : undefined;
                _options.style = "elec"
                return new AmapImageryProvider(_options);

            //----------------------------百度地图-------------------------------------
            case "baidu-imagery":
                _options.crs = correct ? "WGS84" : "BD09";
                _options.style = "img"
                return new BaiduImageryProvider(_options);
            case "baidu-street":
                _options.crs = correct ? "WGS84" : "BD09";
                _options.style = "normal"
                return new BaiduImageryProvider(_options);

            case "baidu-dark":
                _options.crs = correct ? "WGS84" : "BD09";
                _options.style = "dark"
                return new BaiduImageryProvider(_options);

            case "tencent-dark":
                // _options.crs = correct ? "WGS84" : "BD09";
                // _options.style = "dark"
                // return new BaiduImageryProvider(_options);
                _options.url = "http://rt3.map.gtimg.com/tile?z={z}&x={x}&y={Y}&styleid=4&scene=0&version=347";
                return new Cesium.UrlTemplateImageryProvider({
                    url: _options.url,
                    // minimumLevel: 3,
                    customTags: {
                        Y: function (imageryProvider, x, y, level) {
                            return (1 << level) - y - 1;
                        }
                    },
                    tilingScheme: correct ? new AmapMercatorTilingScheme() : undefined
                })



            //----------------------------天地图-------------------------------------
            case "tdt-imagery":
                const _tdt_img_ok_options = {
                    // url: `http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${options.token_tdt || defaultOptions.token_tdt}`,

                    //官网示例：不可直接使用，需要替换将tileMatrix、tileRow、tileCol的xyz分别替换，可能跟cesium版本有关
                    //注意：天地图的连接
                    url: `http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=${options.token || defaultOptions.token_tdt}`,
                    layer: "tdtBasicLayer",
                    style: "default",
                    format: "image/jpeg",
                    tileMatrixSetID: "GoogleMapsCompatible",

                }
                Object.assign(_tdt_img_ok_options, _options);
                return new Cesium.WebMapTileServiceImageryProvider(_tdt_img_ok_options);

            //----------------------------arcgis-------------------------------------
            case "arcgis-imagery":
                _options.url = _options.url || 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';
                return new Cesium.ArcGisMapServerImageryProvider(_options)
            // case "arcgis-imagery-offline":
            //     _options.url = `${SDG_OFFLINE_ASSETS_PATH}/arcgis-imagery/world/{z}/{x}/{y}.png`;
            //     // _options.tilingScheme = options.correct ? new AmapMercatorTilingScheme() : undefined;
            //     _options.minimumLevel = 0;
            //     _options.maximumLevel = 7;
            //     return new Cesium.UrlTemplateImageryProvider(_options);

            case "arcgis-street-purplishBlue":
                return new Cesium.ArcGisMapServerImageryProvider(
                    {
                        url: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer",//ok               
                    });
            //----------------------------supermap zxyTileImage通用链接-------------------------------------
            case "superMap-zxyTileImage":
                //example
                // {
                // type: "superMap-zxyTileImage",
                // url: "https://iserver.supermap.io/iserver/services/map-world/rest/maps/%E4%B8%96%E7%95%8C%E5%9C%B0%E5%9B%BE_Night/zxyTileImage",
                // fileExtension: "webp",
                // tileWidth: 256,
                // tileHeight: 256,
                // }
                return new Cesium.UrlTemplateImageryProvider({
                    url: `${_options.url}.${_options.fileExtension || 'png'}?z={z}&x={x}&y={y}&width=${_options.tileWidth || 256}&height=${_options.tileHeight || 256}`
                })


            //----------------------------superMap-zxyTileImage-world--------------------------------------
            case "superMap-zxyTileImage-world":
                return new Cesium.UrlTemplateImageryProvider({
                    url: "https://iserver.supermap.io/iserver/services/map-world/rest/maps/World/zxyTileImage.webp?z={z}&x={x}&y={y}&width=256&height=256"
                })
            //----------------------------tms-------------------------------------
            case "tms":
                if (!JSHelper.IsString(_options.url) || _options.url.length == 0)
                    throw new Error(`load TMS service failed:param url is invalid->${options.url}`);

                _options.format = JSHelper.GetQueryParams(_options.url).format;
                if (_options.format) {
                    _options.fileExtension = _options.format.slice(_options.format.indexOf("/") + 1);
                    _options.url = _options.url.slice(0, _options.url.indexOf("?"));
                }


                if (!JSHelper.IsString(_options.fileExtension)) {
                    throw new Error(`load TMS service failed:picture format is unknown`);
                }

                return new Cesium.TileMapServiceImageryProvider(
                    {
                        //google-全球卫星影像
                        // url: "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali",
                        // url: "http://localhost:8099/geodata/imageryTiles/TMS-Google-WorldImagery-0-7",
                        url: _options.url,
                        // fileExtension: _options.fileExtension,
                        fileExtension: _options.fileExtension

                        // tilingScheme: options.options.wkid == 4326 ? new Cesium.GeographicTilingScheme() : new Cesium.WebMercatorTilingScheme()
                        // tilingScheme: new Cesium.GeographicTilingScheme()
                    });

            //----------------------------WMS-------------------------------------
            case "wms":
                if (!JSHelper.IsString(_options.url) || _options.url.length == 0)
                    throw new Error(`load WMS service failed:param url is invalid->${_options.url}`);

                // _options.url = decodeURIComponent(_options.url);
                cache.parameters = Object.assign({
                    transparent: true,
                }, JSHelper.GetQueryParams(_options.url));

                delete cache.parameters.bbox;
                delete cache.parameters.width;
                delete cache.parameters.height;

                Object.keys(cache.parameters).forEach(key => {
                    if (key != "cql_filter") {
                        cache.parameters[key] = decodeURIComponent(cache.parameters[key]);
                    }
                })

                cache.layers = cache.parameters.layers;
                delete cache.parameters.layers;
                cache.baseUrl = _options.url.slice(0, _options.url.indexOf("?"));


                //--显示指定的参数
                if (_options.hasOwnProperty("styles"))
                    cache.parameters.styles = _options.styles;

                if (_options.cql_filter && _options.cql_filter != "")
                    cache.parameters.cql_filter = _options.cql_filter;//查询参数

                cache.parameters.service = "WMS";
                return new Cesium.WebMapServiceImageryProvider(
                    {
                        url: cache.baseUrl,
                        layers: cache.layers,//图层组通过逗号分开，名称按 工作空间:图层名 组成
                        parameters: cache.parameters,
                        enablePickFeatures: _options.enablePickFeatures || false,//启用鼠标拾取，需要wms放开查询功能。在关闭情况下查询将提示no features found
                    });

            //----------------------------WMTS-------------------------------------
            case "wmts":
                if (!JSHelper.IsString(_options.url) || _options.url.length == 0)
                    throw new Error(`load WMTS failed:param url is invalid->${options.url}`);

                if (!_options.layer)
                    throw new Error(`load wmts service failed:layer is required`);

                // if (!JSHelper.IsString(_options.tileMatrixSetID) || _options.tileMatrixSetID.length == 0)
                //     throw new Error(`load wmts failed:tileMatrixSetID is invalid`);

                cache.tileMatrixSetID = _options.tileMatrixSetID || "EPSG:4326"
                cache.layer = _options.layer;
                cache.style = _options.style || "";
                cache.tilingScheme = _options.tilingScheme || new Cesium.GeographicTilingScheme();
                cache.format = _options.format || "image/png";
                cache.parameters = JSHelper.GetQueryParams(_options.url)
                if (cache.parameters.format && cache.parameters.format != cache.format) {
                    _options.url.replace(cache.parameters.format, cache.format);
                }
                //rebuild url
                cache.url = _options.url.replace("{TileMatrix}", "{TileMatrixSet}:{TileMatrix}");

                //layer
                // url: "http://localhost:8098/geoserver/gwc/service/wmts/rest/tiger:GF1_WFV1_E121.6_N24.6_20200619_L1A00048797181/{style}/{TileMatrixSet}/{TileMatrixSet}:{TileMatrix}/{TileRow}/{TileCol}?format=image/png",

                // cache.index1 = _options.url.indexOf("/{style}");
                // cache.index2 = _options.url.slice(0, cache.index1).lastIndexOf("/") + 1;
                // cache.layer = options.url.slice(cache.index2, cache.index1);//district:name

                return new Cesium.WebMapTileServiceImageryProvider(
                    {
                        // url: "http://10.15.111.14:58888/geoserver/gwc/service/wmts/rest/NJSDATA_TEST:L18/{style}/{TileMatrixSet}/{TileMatrixSet}:{TileMatrix}/{TileRow}/{TileCol}?format=image/png",
                        url: cache.url,
                        layer: cache.layer,
                        format: cache.format,
                        tileMatrixSetID: cache.tileMatrixSetID,// "NJSdata-3857",
                        style: cache.style,
                        tilingScheme: cache.tilingScheme,
                        rectangle: _options.rectangle
                        // minimumLevel: _options.minimumLevel || 0,
                        // maximumLevel: _options.maximumLevel || undefined,
                    }
                );
            //----------------------------TileLayer-------------------------------------

            // case "tile":
            //     if (!JSHelper.IsString(_options.url) || _options.url.length == 0)
            //         throw new Error(`create urlTemplateProvider failed:param url is invalid->${options.url}`);
            //     return new Cesium.UrlTemplateImageryProvider(_options);

            //----------------------------WFS-------------------------------------
            default:
                throw new Error(`create imagery provider failed:invalid type->${type}`)
        }
    }


}

export { ImageryProviderFactory }