import {JSHelper  } from "../../../libs/JSHelper.js";



class NotifySizeChangedArray extends Array
{


    _handlers = [];

 
    constructor(...args)
    {
        super(...args);
    }



    push(...items)
    {
        let result = super.push(...items);
        this._excuteHanders({ type: "push", data: items });
        return result;
    }
    unshift(...items)
    {
        let result = super.unshift(...items);
        this._excuteHanders({ type: "shift", data: items });
        return result;
    }

    pop()
    {
        let result = super.pop();
        this._excuteHanders({ type: "pop", data: [result] });
        return result;
    }

    shift()
    {
        let result = super.shift();
        this._excuteHanders({ type: "shift", data: [result] });
        return result;
    }

    splice(index, howmany, ...item)
    {
        let result = super.splice(index, howmany, ...item);
        let type = JSHelper .IsInteger(howmany) && howmany > 0 ? "pop" : "push";
        this._excuteHanders({ type: type, data: type == "pop" ? result : JSHelper.IsArray(item) ? item : [] });
        return result;
    }





    /**
     * 添加长度更改回调函数(支持异步函数)
     *
     * @param {Function|AsyncFunction} handler 回调函数
     * @memberof NotifySizeChangedArray
     */
    addHandler(handler)
    {
        if (JSHelper.IsFunction(handler) || JSHelper.IsAsyncFunction(handler))
        {
            this._handlers.push(handler);
        }
    }


    /**
     * 移除长度更改回调函数
     *
     * @param {Function|AsyncFunction} handler 回调函数
     * @memberof NotifySizeChangedArray
     */
    removeHander(handler)
    {
        if (JSHelper.IsFunction(handler) || JSHelper.IsAsyncFunction(handler))
        {
            for (let i = 0; i < this._handlers.length; i++)
            {
                if (this._handlers[i] === handler)
                {
                    this._handlers.splice(i, 1);
                }
            }
        }
    }


    /**
     * 移除所有长度更改回调函数
     *
     * @memberof NotifySizeChangedArray
     */
    removeAllHanders()
    {
        this._handlers.splice(0);
    }

    _excuteHanders(args)
    {
        for (let i = 0; i < this._handlers.length; i++)
        {
            // this._handlers[i].call(this, args);
            this._handlers[i](args);
        }
    }


    /**
     * 将普通数组转换为NotifySizeChangedArray，使之能够监听size changed事件(无性能损失)
     * @static
     * @param {Array} arr
     * @returns {NotifySizeChangedArray}
     * @throws {Error}
     * @memberof NotifySizeChangedArray
     */
    static Transform(arr)
    {
        if (!JSHelper.IsArray(arr))
            throw new Error("Array type required");

        if (!(graphics instanceof NotifySizeChangedArray))
            graphics.__proto__ = NotifySizeChangedArray.prototype;
        return arr;
    }
}

export { NotifySizeChangedArray }