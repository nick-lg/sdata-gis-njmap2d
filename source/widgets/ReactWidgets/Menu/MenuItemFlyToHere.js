import React from "react";
import { ViewPoint } from "../../../core/map/ViewPoint";
import { MenuItem } from "./MenuItem";
import { ReactSVG } from 'react-svg'
import svg_fly from "../../../assets/svg/fly.svg"




/**
 * @summary 飞至该点
 *
 * @extends {MenuItem}
 */
class MenuItemFlyToHere extends MenuItem {

    constructor(options) {
        super(options)
        this.label = "飞至该点";
        this.icon = <span className="anticon sdg-menu-icon">
            <ReactSVG src={svg_fly}></ReactSVG>
        </span>;
        this.onClick = (e) => {
            let map = this.map;
            let mouseEventArg = map.menu.mouseEventArg;
            if (mouseEventArg.wgs84SurfacePosition) {
                map.flyToViewPoint(
                    new ViewPoint([mouseEventArg.wgs84SurfacePosition.lng, mouseEventArg.wgs84SurfacePosition.lat, mouseEventArg.wgs84SurfacePosition.alt], map.viewPoint.heading, map.viewPoint.pitch, map.viewPoint.roll), 2
                )
            }
            map.menu.visible = false;
        }
    }
}

export { MenuItemFlyToHere }