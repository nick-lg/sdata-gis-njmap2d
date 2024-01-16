import { CesiumHelper } from "../../../../libs/CesiumHelper";
import { JSHelper } from "../../../../libs/JSHelper";
import { SymbolType } from "../../base/Constants";
import { SimpleMarkerSymbol } from "../../symbol/SimpleMarkerSymbol";

class GraphicHelper {

    static CreatePointGraphic(geometry, options = {}) {

        if (geometry instanceof Cesium.ConstantPositionProperty
            || geometry instanceof Cesium.SampledPositionProperty
            || geometry instanceof Cesium.TimeIntervalCollectionPositionProperty
            || geometry instanceof Cesium.CompositePositionProperty) {
            options.position = geometry;
        }
        else {
            const point = getPoint(geometry);
            if (!point) return;
            options.position = Cesium.Cartesian3.fromDegrees(...point.coordinates);
        }


        const symbols = getSymbols(options.symbol, new SimpleMarkerSymbol());
        delete options.symbol

        let entity = new Cesium.Entity(options);
        applySymbols(entity, symbols);
        // if (options.orientation)
        //     entity.orientation = options.orientation;

        return entity;
    }

    static CreatePolylineGraphic() {

    }

    static CreatePolygonGraphic() {

    }


    static CreateMultiLineGraphic() {

    }

    static CreateMultiPolygonGraphic() {

    }
}

function getPoint(geometry) {
    if (JSHelper.IsArray(geometry)) {
        return {
            type: "Point",
            coordinates: geometry
        }
    }
    else if (JSHelper.IsObject(geometry) && geometry.type == "Point") {
        return geometry
    }
    return undefined;
}


function getSymbols(symbol, defaultSymbol) {
    let symbols;
    if (JSHelper.IsArray(symbol) && symbol.length > 0)
        symbols = symbol;
    else
        symbols = [symbol || defaultSymbol]
    return symbols;
}



function applySymbols(entity, symbols) {
    let sym;
    for (let i = 0; i < symbols.length; i++) {
        sym = symbols[i];
        switch (sym.type) {
            case SymbolType.SIMPLE_MARKER:
                applySimpleMarkerSymbol(entity, sym);
                break;
            case SymbolType.PICTURE_MARKER:
                applyPictureMarkerSymbol(entity,sym);
                break;
            case SymbolType.MESH:
                applyMeshSymbol(entity, sym)
                break;
            default:
                break;
        }
    }
}




function applySimpleMarkerSymbol(entity, symbol) {
    entity.point = new Cesium.PointGraphics({
        pixelSize: symbol.size,
        color: CesiumHelper.RgbaToCesiumColor(symbol.color || [255, 0, 0, 1]),
        outlineColor: CesiumHelper.RgbaToCesiumColor(symbol.outlineColor || [255, 255, 0, 1]),
        outlineWidth: symbol.outlineWidth || 0
    })

}


function applyPictureMarkerSymbol(entity,symbol)
{
    entity.billboard=new Cesium.BillboardGraphics({
        image:symbol.image,
        width:symbol.width,
        height:symbol.height,
        horizontalOrigin:symbol.horizontalOrigin,
        verticalOrigin:symbol.verticalOrigin,
        scale:symbol.scale
    })
}


function applyMeshSymbol(entity, symbol) {
    entity.model = new Cesium.ModelGraphics({
        uri: symbol.url,
        color: Cesium.Color.fromBytes(symbol.color[0], symbol.color[1], symbol.color[2], Math.min(Math.floor((symbol.color[4] || 1)) * 255, 255)),
        colorBlendMode: symbol.colorBlendMode,
        colorBlendAmount: symbol.colorBlendAmount,
        runAnimations: symbol.runAnimations,
        scale: symbol.scale,
        minimumPixelSize: symbol.minPixelSize,
        maximumScale: symbol.maxScale
    })
    entity.orientation = symbol.orientation;
}

export { GraphicHelper, getPoint }
