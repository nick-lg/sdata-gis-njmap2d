import { JSHelper } from "./JSHelper.js";


/**
 * @summary 动画类(基于window.requestAnimationFrame)
 *
 */
class Animation
{
    _handler;//动画回调
    _interval;//动画间隔(s)
    _multiplier;//快放系数
    _actualInterval;//实际动画间隔
    _canAnimation;
    _handlerID;
    _currentTime;
    _lastTime;


    /**
     * 动画间隔
     *
     * @memberof Animation
     */
    get interval()
    {
        return this._interval;
    }

    set interval(value)
    {
        if (JSHelper.IsNumber(value) && value > 0)
        {
            this._interval = value;
            this._actualInterval = this._interval / this._multiplier;
        }
        else
        {
            throw new Error(`invalid interval: ${value},positive value required`);
        }
    }



    /**
     * 播放倍率
     * 
     * @memberof Animation
     */
    get multiplier()
    {
        return this._multiplier;
    }

    set multiplier(value)
    {
        if (JSHelper.IsNumber(value) && value > 0)
        {
            this._multiplier = value;
            this._actualInterval = this._interval / this._multiplier;
        }
        else
        {
            throw new Error(`invalid multiplier: ${value},positive value required`)
        }
    }


    get isRunning()
    {
        return this._canAnimation;
    }


    /**
     * 
     * @param {Function} handler 动画回调
     * @param {integer} interval 动画间隔(ms)
     * @param {number} [multiplier=1.0] 播放倍率
     */
    constructor(handler, interval, multiplier)
    {
        if (!JSHelper.IsNumber(interval) | interval < 0)
            throw new Error(`invalid animation interval:${interval},positive number required`);

        if (!JSHelper.IsFunction(handler))
        {
            throw new Error("invalid animaion hander,function or async function required");
        }

        multiplier = JSHelper.IsNumber(multiplier) && multiplier > 0 ? multiplier : 1.0;


        this._handler = handler;
        this._handler.bind(this);

        this._interval = interval;
        this._multiplier = multiplier;
        this._actualInterval = this._interval / this._multiplier;
    }



    /**
     * 启动动画
     *
     * @memberof Animation
     */
    start()
    {
        this._canAnimation = true;
        this._tick();
    }

    /**
     * 暂停动画
     *
     * @memberof Animation
     */
    pause()
    {
        this._canAnimation = false;
    }


    /**
     * 停止动画
     *
     * @memberof Animation
     */
    stop()
    {
        this._canAnimation = false;
        if (JSHelper.IsInteger(this._handlerID))
        {
            cancelAnimationFrame(this._handlerID);
            this._handlerID = undefined;
        }
    }

    _tick(e)
    {
        if (!this._canAnimation)
            return;

        this._currentTime = Date.now();
        if (!this._lastTime || this._currentTime - this._lastTime >= this._actualInterval)
        {
            this._lastTime = this._currentTime;
            this._handler();
        }
        this._handlerID = requestAnimationFrame(this._tick.bind(this));
    }
}

export { Animation }