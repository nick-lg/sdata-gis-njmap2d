
const vvp = new Cesium.VelocityVectorProperty(undefined, false);
let tempCartesian3 = new Cesium.Cartesian3();
let tempMatrix4 = new Cesium.Matrix4();
const P1 = 0.2777777777777778;

class MapUtil {
    /**
     * 计算目标某时刻速度
     *
     * @static
     * @param {Cesium.Entity} target
     * @param {Cesium.JulianDate} time
     * @param {Interger} [unit=0] 速度单位。0：m/s,1:km/h
     * @return {Number} 
     * @memberof MapUtil
     */
    static getSpeed(target, time, unit = 0) {
        if (!(target instanceof Cesium.Entity) || !target.position || !time)
            return undefined;

        vvp.position = target.position;
        let value = Cesium.Cartesian3.magnitude(vvp.getValue(time, tempCartesian3));
        return !value ? undefined : (unit == 1 ? value * P1 : value);
    }



    /**
     * 计算方位角
     *
     * @static
     * @param {Array.<Number>|Cesium.Cartesian3} p1
     * @param {Array.<Number>|Cesium.Cartesian3} p2
     * @return {Number} 
     * @memberof MapUtil
     */
    static ComputeAzimuth(p1, p2) {
        let cp1 = p1 instanceof Cesium.Cartesian3 ? p1.clone() : Cesium.Cartesian3.fromDegrees(...p1);
        let cp2 = p2 instanceof Cesium.Cartesian3 ? p2.clone() : Cesium.Cartesian3.fromDegrees(...p2);
        let m = Cesium.Transforms.eastNorthUpToFixedFrame(cp1, Cesium.Ellipsoid.WGS84, tempMatrix4);
        m = Cesium.Matrix4.inverse(m, m);
        cp2 = Cesium.Matrix4.multiplyByPoint(m, cp2, tempCartesian3);
        let res = Math.atan2(cp2.x, cp2.y) * 180 / Math.PI;
        if (res < 0)
            res += 360;
        return res;
    }
}


export { MapUtil }