import React from "react";
import { JSHelper } from "../../../../libs/JSHelper";
import { MeasureType } from "../../../core/base/Constants";
import { MeasureTool } from "../../../interactions/MeasureTool";
import { MenuItem } from "./MenuItem";
import { ReactSVG } from 'react-svg'

import svg_measure from "../../../assets/svg/measure.svg";
import svg_measure_distance from "../../../assets/svg/measure-distance.svg"
import svg_measure_area from "../../../assets/svg/measure-area.svg"
import svg_clear from "../../../assets/svg/clear.svg";

/**
 * @summary 图上量测子菜单
 *
 * @extends {MenuItem}
 */
class MenuItemMapMeasure extends MenuItem {
    #innerOptions;
    constructor(options = {}) {
        super(options)
        this.#innerOptions = options;
        this.label = "图面量测";
        this.icon = <span className="anticon sdg-menu-icon">
            <ReactSVG src={svg_measure}></ReactSVG>
        </span>;
        this.children = [
            {

                label: "测距",
                icon: <span className="anticon sdg-menu-icon">
                    <ReactSVG src={svg_measure_distance}></ReactSVG>
                </span>,
                key: JSHelper.GenerateGUID(),
                onClick: (e) => {
                    if (!this.map.measureTool)
                        this.#initMeasureTool();
                    this.map.measureTool.activate(MeasureType.DISTANCE);
                    this.#hideMenu()
                }
            },
            {
                label: "测面积",
                icon: <span className="anticon sdg-menu-icon">
                    <ReactSVG src={svg_measure_area}></ReactSVG>
                </span>,
                key: JSHelper.GenerateGUID(),
                onClick: (e) => {
                    if (!this.map.measureTool)
                        this.#initMeasureTool();
                    this.map.measureTool?.activate(MeasureType.AREA);
                    this.#hideMenu()
                }
            },
            {
                label: "清除",
                icon: <span className="anticon sdg-menu-icon">
                    <ReactSVG src={svg_clear}></ReactSVG>
                </span>,
                key: JSHelper.GenerateGUID(),
                onClick: (e) => {
                    this.map.measureTool?.clear();
                    this.#hideMenu()
                }
            }
        ]
    }


    #initMeasureTool() {
        //绘制图层
        let measureTool = new MeasureTool(this.#innerOptions || {
            layer: new EntityLayer({
                name: "measureLayer"
            }),
            style: {
                anchor: {
                    size: 6,
                    color: [255, 255, 255, 1],
                    outlineColor: [255, 0, 0, 1],
                    outlineWidth: 2
                },
                polygon: {
                    fill: [255, 255, 0, 0.2]
                },
                measurement: {
                    decimals: 2,
                    font: "10px sans-serif",
                    color: [136, 136, 136, 1],
                    backgroundColor: [255, 255, 255, 1],
                    pixelOffset: [0, -32]
                }
            },
        })
        this.map.addInteraction(measureTool);
        return measureTool
    }

    #hideMenu() {
        setTimeout(() => {
            this.map.menu.visible = false;
        }, 300);
    }
}

export { MenuItemMapMeasure }