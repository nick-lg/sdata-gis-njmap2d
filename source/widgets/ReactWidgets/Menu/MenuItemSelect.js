import React from "react";
import { MenuItem } from "./MenuItem";
import { ReactSVG } from 'react-svg'
import { TargetType } from "../../../core/base/Constants";
import svg_select_feature from "../../../assets/svg/select-feature.svg";


/**
 * @summary 要素选择子菜单
 *
 * @extends {MenuItem}
 */
class MenuItemSelect extends MenuItem {

    constructor(options) {
        super(options)
        this.label = "选择要素";
        this.icon = <span className="anticon sdg-menu-icon">
            <ReactSVG src={svg_select_feature}></ReactSVG>
        </span>;

        this.onClick = (e) => {
            let map = this.map;
            map.clearSelections();//单选模式，清空当前选择集

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
            map.select(target);

            // mouseEventArg.target.layer.remove(target);
            this.map.menu.visible = false;
        }
    }
}

export { MenuItemSelect }