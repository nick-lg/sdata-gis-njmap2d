import React from "react";
import { MenuItem } from "./MenuItem";
import { ReactSVG } from 'react-svg'
import { TargetType } from "../../../core/base/Constants";
import svg_clear_feature from "../../../assets/svg/clear-feature.svg"

/**
 * @summary 取消要素选择子菜单
 *
 * @extends {MenuItem}
 */
class MenuItemUnSelect  extends MenuItem {

    constructor(options) {
        super(options)
        this.label = "取消要素选择";
        this.icon = <span className="anticon sdg-menu-icon">
            <ReactSVG src={svg_clear_feature}></ReactSVG>
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
                case TargetType.CESIUM_3DTILE_FEATURE:
                    target = delegate;
                // break;
                // default:
                // break;
            }
            map.unSelect(target);


            // mouseEventArg.target.layer.remove(target);
            map.menu.visible = false;
        }
    }
}

export { MenuItemUnSelect  }