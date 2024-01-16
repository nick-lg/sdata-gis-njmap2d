import { JSHelper } from "../../../../libs/JSHelper";


/**
 * @summary 菜单项基类
 * 
 * @param {Object} [options={}]
 * @param {String} options.label 文本
 * @param {Function} options.command 指令
 * @param {ReactNode} [options.icon] 图标
 * @param {String} [options.group] 菜单分组名
 * @param {Array.<MenuItem>} [options.children] 子菜单
 *
 */
class MenuItem {
    icon;
    label;
    onClick;
    map;
    group;
    children;
    context;

    _userdata = {
        condition: undefined//显示条件(boolean or predicate)

    }



    constructor(options = {}) {
        this.key = JSHelper.GenerateGUID();
        this.icon = options.icon;
        this.label = options.label;
        this.context = options.context;


        const context = options.context;

        if (JSHelper.IsFunction(options.command)) {
            const command = options.command.bind(context);
            this.onClick = (e) => {
                command(e);
                if (e.item.props.map?.menu)
                    e.item.props.map.menu.visible = false;
            }

        }

        delete options.command;
        delete this.command;

        //props not in type number or string will throw warnning via react
        // if (JSHelper.IsFunction(options.condition)) {
        //     // let func = options.condition.toString();
        //     // if (func.indexOf("=>") > -1)
        //     //     this.condition = func;
        //     // else {
        //     //     // this.condition = `${func.slice(func.indexOf("("), func.indexOf(")") + 1)}=>${func.slice(func.indexOf("{"))}`;

        //     //     // this.condition=func;
        //     //     debugger
        //     //     let a = func.indexOf("function");
        //     //     let b = func.indexOf("(");
        //     //     let c = func.slice(a + 8, b)
        //     //     if (c.trim() == 0) {
        //     //         this.condition = `function fuck_gis${func.slice(b)}`;
        //     //     }
        //     // }

        //     this.condition=options.condition;
        //     this._userdata.condition=options.condition
        // }
        // else {
        //     this.condition = (() => true).toString();
        // }


        this._userdata.condition = JSHelper.IsFunction(options.condition) ? options.condition : () => true

    }
}

export { MenuItem }


