import { CesiumHelper } from "../../../../libs/CesiumHelper";
import { JSHelper } from "../../../../libs/JSHelper.js";

const defaultGlobalStyles = {
    point: {
        type: "simple-marker",
        size: 12,
        color: [255, 0, 0, 1],
        outlineColor: [255, 0, 0, 1],
        outlineWidth: 0
    },
    polyline: {
        width: 2,
        color: [252, 128, 70, 1]
    },
    polygon: {
        color: [255, 255, 0, 0.2],
        outlineColor: [245, 122, 122, 1],
        outlineWidth: 2
    }
}

class GeoJSONHelper {
    //绘制样式，修改后影像后续绘制，类似canvas
    globalStyles;
    constructor(options = {}) {
        this.globalStyles = options.globalStyles || GeoJSONHelper.GetDefaultStyles();
    }


    createCesiumPointGraphics() {
        let symbol = this.globalStyles?.point || defaultGlobalStyles.point;

        if (!symbol.type)
            symbol.type = "simple-marker";

        if (symbol.type != "simple-marker") {
            console.warn(`point symbol with type ${symbol.type} is not supported`)
        }

        return new Cesium.PointGraphics({
            pixelSize: typeof symbol.size == "number" ? symbol.size : defaultGlobalStyles.point.size,
            color: CesiumHelper.RgbaToCesiumColor(symbol.color || defaultGlobalStyles.point.color),
            outlineColor: CesiumHelper.RgbaToCesiumColor(symbol.outlineColor || defaultGlobalStyles.point.outlineColor),
            outlineWidth: typeof symbol.outlineWidth == "number" ? symbol.outlineWidth : defaultGlobalStyles.point.outlineWidth
        })
    }

    createCesiumPolylineGraphics(geometry) {
        let symbol = this.globalStyles?.polyline || defaultGlobalStyles.polyline;
        return new Cesium.PolylineGraphics({
            positions: geometry.coordinates.map(v => Cesium.Cartesian3.fromDegrees(...v)),
            width: typeof symbol.width == "number" ? symbol.width : defaultGlobalStyles.polyline.width,
            material: CesiumHelper.RgbaToCesiumColor(symbol.color || defaultGlobalStyles.polyline.color)
        })
    }

    createCesiumPolygonGraphics(geometry) {
        let symbol = this.globalStyles?.polygon || defaultGlobalStyles.polygon;
        return new Cesium.PolygonGraphics({
            hierarchy: new Cesium.PolygonHierarchy(geometry.coordinates[0].map((v) => {
                return Cesium.Cartesian3.fromDegrees(...v);

            })),
            material: CesiumHelper.RgbaToCesiumColor(symbol.color || defaultGlobalStyles.polygon.color)
        })
    }

    pointToEntity(geometry) {
        return new Cesium.Entity(
            {
                position: Cesium.Cartesian3.fromDegrees(...geometry.coordinates),
                point: this.createCesiumPointGraphics()
            }
        )
    }

    lineToEntity(geometry) {
        return new Cesium.Entity(
            {
                polyline: this.createCesiumPolylineGraphics(geometry)
            });
    }

    polygonToEntity(geometry) {
        return new Cesium.Entity(
            {
                polygon: this.createCesiumPolygonGraphics(geometry)
            }
        )
    }

    multiPolylineToEntity(geometry) {
        const coordinates = geometry.coordinates;
        let entity;
        coordinates.forEach((line, index) => {
            if (index == 0) {
                entity = this.lineToEntity({ coordinates: line });
            }
            else {
                this.lineToEntity({ coordinates: line }).parent = entity;
            }
        }, this);
        return entity;
    }

    geometryToEntity(geometry) {
        switch (geometry.type) {
            case "Point":
                return this.pointToEntity(geometry)
            case "LineString":
                return this.lineToEntity(geometry);
            case "MultiLineString":
                return this.multiPolylineToEntity(geometry);
            case "Polygon":
                return this.polygonToEntity(geometry);
            default:
                break;
        }
    }

    static GetDefaultStyles() {
        JSHelper.DeepClone(defaultGlobalStyles);
    }



    static DecodePolygon(coordinate, encodeOffsets, encodeScale) {
        var result = [];
        var prevX = encodeOffsets[0];
        var prevY = encodeOffsets[1];
        for (var i = 0; i < coordinate.length; i += 2) {
            var x = coordinate.charCodeAt(i) - 64;
            var y = coordinate.charCodeAt(i + 1) - 64;

            // ZigZag decoding
            x = (x >> 1) ^ -(x & 1);
            y = (y >> 1) ^ -(y & 1);

            // Delta deocding
            x += prevX;
            y += prevY;
            prevX = x;
            prevY = y;

            // Dequantize
            result.push([x / encodeScale, y / encodeScale]);
        }
        return result;
    }

    static DecodeGeo(json) {
        if (!json.UTF8Encoding) {
            return json;
        }
        var encodeScale = json.UTF8Scale;
        if (encodeScale == null) {
            encodeScale = 1024;
        }
        var features = json.features;
        for (var f = 0; f < features.length; f++) {
            var feature = features[f];
            var geometry = feature.geometry;
            var coordinates = geometry.coordinates;
            var encodeOffsets = geometry.encodeOffsets;
            for (var c = 0; c < coordinates.length; c++) {
                var coordinate = coordinates[c];
                if (geometry.type === "Polygon") {
                    coordinates[c] = GeoJSONHelper.DecodePolygon(
                        coordinate,
                        encodeOffsets[c],
                        encodeScale
                    );
                } else if (geometry.type === "MultiPolygon") {
                    for (var c2 = 0; c2 < coordinate.length; c2++) {
                        var polygon = coordinate[c2];
                        coordinate[c2] = GeoJSONHelper.DecodePolygon(
                            polygon,
                            encodeOffsets[c][c2],
                            encodeScale
                        );
                    }
                }
            }
        }

        delete json.UTF8Encoding;

        return json;
    }



}

export { GeoJSONHelper }