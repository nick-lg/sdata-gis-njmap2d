import { JSHelper } from "../../../libs/JSHelper.js";

/**
 * @summary 视点类
 *
 */
class ViewPoint {
    position;
    heading;
    pitch;
    roll

    /**
     * 
     * @param {Number[]} position 相机地理位置，形如[lng,lat,height]
     * @param {Number} heading 偏航角(度)
     * @param {Number} pitch 俯仰角(度)
     * @param {Number} roll 横滚角(度)
     * @constructor
     */
    constructor(position, heading, pitch, roll) {
        if (JSHelper.IsArray(position) && position.length > 1) {
            this.position = [+position[0], +position[1], +position[2] || 0];
        }
        else
            throw new Error(`construct ViewPoint failed: position are required to be passed in as an array,but position is ${position}`)

        this.heading = +heading || 0;
        this.pitch = +pitch || 0;
        this.roll = +roll || 0;
    }


  
    toString() {
        return `position:[${this.position[0]}, ${this.position[1]}, ${this.position[2]}],heading:${this.heading},pitch:${this.pitch},roll:${this.roll}]`;
    }


    static FromComponents(lng, lat, height, heading, pitch, roll) {
        return new ViewPoint([lng, lat, height], heading, pitch, roll);
    }
}

export { ViewPoint }