import React from "react";
import { MenuItem } from "./MenuItem";
import { ReactSVG } from 'react-svg'
import svg_clear_all from "../../../assets/svg/clear-all.svg"


/**
 * @summary 清除选择集
 *
 * @extends {MenuItem}
 */
class MenuItemClearSelections extends MenuItem {

    constructor(options) {
        super(options)
        this.label = "清除选择集";
        this.icon = <span className="anticon sdg-menu-icon">
            <ReactSVG src={svg_clear_all}></ReactSVG>
        </span>;

        this.onClick = (e) => {
            this.map.clearSelections();
            this.map.menu.visible = false;
        }
    }
}

export { MenuItemClearSelections }