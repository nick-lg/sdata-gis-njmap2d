import React from "react";
import { MenuItem } from "./MenuItem";
import { ReactSVG } from 'react-svg'
import { TargetType } from "../../../core/base/Constants";

import svg_delete from "../../../assets/svg/delete.svg";


/**
 * @summary 删除目标
 *
 * @extends {MenuItem}
 */
class MenuItemDeleleTarget extends MenuItem {

    constructor(options) {
        super(options)
        this.label = "删 除";
        this.icon = <span className="anticon sdg-menu-icon">
            <ReactSVG src={svg_delete}></ReactSVG>
        </span>;



        this.onClick = (e) => {
            let map = this.map;
            let mouseEventArg = map.menu.mouseEventArg;
            let delegate = mouseEventArg.target.delegate;
            let target;
            switch (mouseEventArg.target.type) {
                case TargetType.ENTITY:
                    target = delegate.id;
                    break;
                case TargetType.PRIMITIVE:
                case TargetType.GROUND_PRIMITIVE:
                case TargetType.POINT_PRIMITIVE:
                case TargetType.MODEL_PRIMITIVE:
                    target = delegate.primitive;
                    break;
                // case TargetType.CESIUM_3DTILE_FEATURE:
                //     target = delegate;
                // break;
                // default:
                // break;
            }

            mouseEventArg.target.layer.remove(target);
            this.map.menu.visible = false;
        }
    }
}

export { MenuItemDeleleTarget }