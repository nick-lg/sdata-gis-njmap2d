const directTypes = ["number", "string", "boolean"];


let scrachValue,
    scrachType,
    scrachKeys,
    scrachCartographic = new Cesium.Cartographic(),
    scrachCartesian3 = new Cesium.Cartesian3();



Cesium.Cartesian2.prototype.toPacket = function () {
    return {
        cartesian2: [this.x, this.y]
    }
}



Cesium.Cartesian3.prototype.toPacket = function () {
    return {
        cartesian: [this.x, this.y, this.z]
    }
}


Cesium.Color.prototype.toPacket = function (time) {
    return {
        rgba: this.toBytes()
    }
}

Cesium.Rectangle.prototype.toPacket = function () {
    return {
        wsenDegrees: [this.west * Cesium.Math.DEGREES_PER_RADIAN, this.south * Cesium.Math.DEGREES_PER_RADIAN, this.east * Cesium.Math.DEGREES_PER_RADIAN, this.north * Cesium.Math.DEGREES_PER_RADIAN],
    }
}


Cesium.TimeIntervalCollection.prototype.toPacket = function () {
    const intervals = this._intervals || [];
    if (intervals.length == 0)
        return undefined
    else {
        let startTime = Cesium.JulianDate.toIso8601(intervals[0].start);
        let stopTime = Cesium.JulianDate.toIso8601(intervals[0].stop);
        return `${startTime}/${stopTime}`
    }
}




//#region  Property

Array.prototype.toPacket = function () {
    if (this.length.length == 0)
        return []

    let ele = this[0], values = [];
    if (ele instanceof Cesium.Cartesian3) {
        this.forEach(e => {
            Cesium.Cartographic.fromCartesian(e, Cesium.Ellipsoid.WGS84, scrachCartographic);
            values.push(
                scrachCartographic.longitude * Cesium.Math.DEGREES_PER_RADIAN,
                scrachCartographic.latitude * Cesium.Math.DEGREES_PER_RADIAN,
                scrachCartographic.height
            )

        })
        return {
            cartographicDegrees: values
        }
    }
    else if (directTypes.indexOf(typeof ele) > -1) {
        return this;
    }
    return []
}

Cesium.ConstantProperty.prototype.toPacket = function () {
    if (this._value.toPacket)
        return this._value.toPacket();
    return this._value;
}

Cesium.ColorMaterialProperty.prototype.toPacket = function (time) {
    return {
        solidColor: {
            color: {
                rgba: this.color.getValue().toBytes()
            }
        }
    }
}

Cesium.PolylineDashMaterialProperty.prototype.toPacket = function () {
    return {
        polylineDash: getPacket(this)
    }
}


Cesium.ConstantPositionProperty.prototype.toPacket = function () {
    Cesium.Cartographic.fromCartesian(this._value, Cesium.Ellipsoid.WGS84, scrachCartographic);
    return {
        cartographicDegrees: [
            scrachCartographic.longitude * Cesium.Math.DEGREES_PER_RADIAN,
            scrachCartographic.latitude * Cesium.Math.DEGREES_PER_RADIAN,
            scrachCartographic.height
        ]
    }
}

Cesium.SampledProperty.prototype.toPacket = function () {
    const times = this._times;
    const values = this._values;
    const res = [];

    times.forEach((t, i) => {
        res.push(Cesium.JulianDate.toIso8601(t), values[i]);
    })


    const packet = {
        number: res,
        interpolationAlgorithm: this.interpolationAlgorithm.type,
        interpolationDegree: this.interpolationDegree
    }
    return packet;
}


Cesium.SampledPositionProperty.prototype.toPacket = function () {
    const times = this._property._times;
    const values = this._property._values;
    const cartographicDegrees = [];
    times.forEach((t, i) => {
        Cesium.Cartesian3.fromElements(values[i * 3], values[i * 3 + 1], values[i * 3 + 2], scrachCartesian3);
        Cesium.Cartographic.fromCartesian(scrachCartesian3, Cesium.Ellipsoid.WGS84, scrachCartographic);
        cartographicDegrees.push(Cesium.JulianDate.toIso8601(t), scrachCartographic.longitude * Cesium.Math.DEGREES_PER_RADIAN,
            scrachCartographic.latitude * Cesium.Math.DEGREES_PER_RADIAN,
            scrachCartographic.height
        )
    })

    const packet = {
        cartographicDegrees: cartographicDegrees,
        interpolationAlgorithm: this.interpolationAlgorithm.type,
        interpolationDegree: this.interpolationDegree
    }
    return packet;
}


Cesium.CallbackProperty.prototype.toPacket = function () {
    let value = this.getValue();
    return value.toPacket ? value.toPacket() : value;
}

//#endregion

Cesium.PointGraphics.prototype.toPacket = function () {
    return getPacket(this);
}


Cesium.PolylineGraphics.prototype.toPacket = function () {
    return getPacket(this);
}

Cesium.PolygonGraphics.prototype.toPacket = function () {
    return getPacket(this);
}

Cesium.PolygonHierarchy.prototype.toPacket = function () {
    return this.positions.toPacket();
}

Cesium.RectangleGraphics.prototype.toPacket = function () {
    return getPacket(this);
}


Cesium.BillboardGraphics.prototype.toPacket = function () {
    const packet = getPacket(this);

    scrachKeys = Object.keys(Cesium.HorizontalOrigin);
    for (let i = 0; i < scrachKeys.length; i++) {
        if (Cesium.HorizontalOrigin[scrachKeys[i]] == packet.horizontalOrigin) {
            packet.horizontalOrigin = scrachKeys[i];
            break;
        }
    }

    scrachKeys = Object.keys(Cesium.VerticalOrigin);
    for (let i = 0; i < scrachKeys.length; i++) {
        if (Cesium.VerticalOrigin[scrachKeys[i]] == packet.horizontalOrigin) {
            packet.verticalOrigin = scrachKeys[i];
            break;
        }
    }
    return packet;
}


Cesium.LabelGraphics.prototype.toPacket = function () {
    return getPacket(this);
}


Cesium.ModelGraphics.prototype.toPacket=function()
{
    let obj= getPacket(this);
    obj.gltf=obj.uri;
    delete obj.uri
    return obj;
}



function getValidKeys(obj) {
    return Object.keys(obj).filter(key => {
        return Cesium.defined(obj[key]);
    })
}



function getPacketKey(key) {
    switch (key) {
        case "_hierarchy":
            return "positions";

        default:
            break;
    }
    if (key.startsWith("_"))
        return key.slice(1);
    return key;
}

function getPacket(object) {
    let validKeys = getValidKeys(object);
    let packet = {};
    let pkey;
    validKeys.forEach(key => {
        scrachValue = object[key];

        pkey = getPacketKey(key);
        if (typeof scrachValue.toPacket == "function")
            scrachType = "packetFunction";
        else
            scrachType = typeof scrachValue;

        switch (scrachType) {
            case "string":
            case "number":
            case "boolean":
                packet[pkey] = scrachValue;
                break;
            case "packetFunction":
                packet[pkey] = scrachValue.toPacket();
                break;
            case "object":
                if (scrachValue.type && scrachValue.coordinates)
                    packet[pkey] = scrachValue;
                break;
            default:
                break;
        }
    })
    return Object.keys(packet).length == 0 ? undefined : packet;
}


const createCzmlPacket = function (entity) {
    if (!(entity instanceof Cesium.Entity))
        return;

    const packet = getPacket(entity);

    //特殊属性处理
    let value
    const specialKeys = ["attributes"];

    specialKeys.forEach(key => {
        value = entity[key];
        if (value) {
            packet[key] = getPacket(value);
        }
    })


    delete packet.propertyNames;
    return packet;
}


const createDocumentPacket = function () {
    //首个元素必须是全局的document节点，代表整个场景的配置(这里啥都没写，使用默认值)
    return {
        "id": "document",
        "version": "1.0"
    }
}


export { createCzmlPacket, createDocumentPacket }








