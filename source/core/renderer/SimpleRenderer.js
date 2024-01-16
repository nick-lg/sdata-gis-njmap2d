import { Renderer } from "./Renderer";


/**
 *
 * @summary 简单渲染器
 *  
 * @extends {Renderer}
 */
class SimpleRenderer extends Renderer {
    symbol;



    /**
     *  
     * @param {Object} options
     * @param {Symbol} options.symbol 渲染符号
     */
    constructor(options) {
        super(options);
        this.type = "simple_renderer";
        this.symbol=options.symbol;
    }
}
export { SimpleRenderer }