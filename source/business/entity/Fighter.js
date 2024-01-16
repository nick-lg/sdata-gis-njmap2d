import { CesiumHelper } from "../../../libs/CesiumHelper";
import { JSHelper } from "../../../libs/JSHelper";

class Fighter extends Cesium.Entity {



    constructor(options = {}) {
        super({});


        this.attributes = {
            config: options
        }



    }


    enableScanningRange(flag) {

        if (this.ellipsoid) {
            this.ellipsoid.show = flag;
            return;
        }


        const positionProperty = this.position;
        if (!(positionProperty instanceof Cesium.SampledPositionProperty)) {
            return;
        }

        const self = this;
        const removeCallback = positionProperty.definitionChanged.addEventListener((e) => {
            debugger
            let p1, p2
            if (positionProperty._property._times.length > 1) {
                p1 = positionProperty.getValue(positionProperty._property._times[0]);
                for (let i = 1; i < positionProperty._property._times.length; i++) {
                    p2 = positionProperty.getValue(positionProperty._property._times[i]);

                    if (!Cesium.Cartesian3.equals(p1, p2)) {
                        removeCallback();


                        p1 = Cesium.Cartographic.fromCartesian(p1);
                        p1 = [
                            p1.longitude * 180 / Math.PI,
                            p1.latitude * 180 / Math.PI,
                            // p1.height
                        ]


                        p2 = Cesium.Cartographic.fromCartesian(p2);
                        p2 = [
                            p2.longitude * 180 / Math.PI,
                            p2.latitude * 180 / Math.PI,
                            // p2.height
                        ]


                        //计算航向
                        const a1 = 0.5 * Math.PI - Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
                        const scanRangeConfig = self.attributes.scanRangeConfig || {
                        }
                        const distance = scanRangeConfig.distance || 100000;
                        const color = JSHelper.IsArray(scanRangeConfig.color) ? CesiumHelper.RgbaToCesiumColor(scanRangeConfig.color) : Cesium.Color.fromBytes(255, 255, 0, 122);

                        self.ellipsoid = new Cesium.EllipsoidGraphics({
                            radii: new Cesium.Cartesian3(distance, distance, distance),
                            innerRadii: new Cesium.Cartesian3(1, 1, 1),//加上它有椎体效果
                            material: color,
                            outlineColor: Cesium.Color.YELLOW,
                            fill: true,
                            outline: true,


                            //水平角,取值范围：[0,2*PI],就是标准的数学上的角度
                            //需要校准起始航向
                            minimumClock: a1 - 45 * Math.PI / 180,
                            maximumClock: a1 + 45 * Math.PI / 180,


                            //天顶角，取值范围：0-PI
                            //很奇怪，天顶角不需要校准
                            minimumCone: 60 * Math.PI / 180,
                            maximumCone: 120 * Math.PI / 180
                        })

                        break;
                    }
                }
            }
        })
    }


    enableScanningEffect(flag) {

    }
}


export {Fighter}