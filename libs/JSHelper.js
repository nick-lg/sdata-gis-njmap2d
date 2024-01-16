/**
 *
 * @summary 封装JavasSript中一些常见的功能，如类型判断、数据请求/下载、数值处理、深浅拷贝、GUID生成等
 * @author nick
 * @date 2022.03.24
 * @class JSHelper
 * @see https://github.com/nick-lg/JSHelper
 */
class JSHelper {

    //#region 数据类型判断

    /**
     * 判断给定参数是否是数值类型
     *
     * @static
     * @param {*} obj
     * @returns {boolean}
     * @memberof JSHelper
     */
    static IsNumber(obj) {
        return Object.prototype.toString.call(obj) === "[object Number]";
    }

    /**
    * 判断给定参数是否是字符类型
    *
    * @static
    * @param {*} obj
    * @returns {boolean}
    * @memberof JSHelper
    */
    static IsString(obj) {
        return Object.prototype.toString.call(obj) === "[object String]";
    }

    /**
   * 判断给定参数是否是布尔类型
   *
   * @static
   * @param {*} obj
   * @returns {boolean}
   * @memberof JSHelper
   */
    static IsBoolean(obj) {
        return Object.prototype.toString.call(obj) === "[object Boolean]";
    }

    /**
    * 判断给定参数是否是Object类型
    *
    * @static
    * @param {*} obj
    * @returns {boolean}
    * @memberof JSHelper
    */
    static IsObject(obj) {
        return Object.prototype.toString.call(obj) === "[object Object]";
    }

    /**
    * 判断给定参数是否是undefined
    *
    * @static
    * @param {*} obj
    * @returns {boolean}
    * @memberof JSHelper
    */
    static IsUndefined(obj) {
        return Object.prototype.toString.call(obj) === "[object Undefined]";
    }

    /**
    * 判断给定参数是否是null
    *
    * @static
    * @param {*} obj
    * @returns {boolean}
    * @memberof JSHelper
    */
    static IsNull(obj) {
        return Object.prototype.toString.call(obj) === "[object Null]";
    }

    /**
     * 判断给定参数是否是函数(不包括异步函数)
     *
     * @static
     * @param {*} obj
     * @returns {boolean}
     * @memberof JSHelper
     */
    static IsFunction(obj) {
        return Object.prototype.toString.call(obj) === "[object Function]";
    }

    /**
    * 判断给定参数是否是异步函数
    *
    * @static
    * @param {*} obj
    * @returns {boolean}
    * @memberof JSHelper
    */
    static IsAsyncFunction(obj) {
        return obj instanceof Object.getPrototypeOf(async function () { }).constructor;
    }


    /**
     * 判断给定参数是否是数组类型
     *
     * @static
     * @param {*} obj
     * @returns {boolean}
     * @memberof JSHelper
     */
    static IsArray(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    }


    /**
    * 判断给定参数是否是整数
    *
    * @static
    * @param {*} obj
    * @returns {boolean}
    * @memberof JSHelper
    */
    static IsInteger(obj) {
        return Object.prototype.toString.call(obj) === "[object Number]" && obj.toString().indexOf(".") == -1;
    }

    //#endregion

    //#region 数值处理

    /**
    *将角度转换为弧度
    *
    * @static
    * @param {number} number 角度(度)
    * @returns {number}
    * @memberof NumberHelper
    */
    static ToRadian(number) {
        return Math.PI * number / 180.0;
    }

    /**
     *将弧度转换为角度
     *
     * @static
     * @param {number} number 角度(弧度)
     * @returns {number} 
     * @memberof NumberHelper
     */
    static ToAngle(number) {
        return number * 180.0 / Math.PI;
    }


    /**
     * 将角度(度)拆分为度分秒
     *
     * @static
     * @param {number} angle 
     * @param {integer} [decimalsForSeconds=undefined] 秒组件保留的小数位数
     * @returns {Array}
     * @memberof JSHelper
     */
    static ToDFM(angle, decimalsForSeconds) {
        let degrees = Math.trunc(angle);
        let minutes = Math.trunc((angle - degrees) * 60);
        let seconds = (angle - degrees - minutes / 60) * 3600;
        return [degrees, minutes, JSHelper.IsInteger(decimalsForSeconds) ? seconds.toFixed(decimalsForSeconds) : seconds];
    }

    /**
     * 将度分秒转换为度
     *
     * @static
     * @param {number} degrees 度
     * @param {number} minutes 分
     * @param {number} seconds 秒
     * @param {integer} [decimals=undeifned]
     * @returns
     * @memberof JSHelper
     */
    static ToDegrees(degrees, minutes, seconds, decimals) {
        if (JSHelper.IsInteger(decimals)) {
            return (degrees + minutes / 60 + seconds / 3600).toFixed(decimals);
        }
        else {
            return degrees + minutes / 60 + seconds / 3600;
        }
    }

    /**
     * 在a,b之间返回线性插值结果
     *
     * @static
     * @param {number} a Specify the start of the range in which to interpolate.
     * @param {number} b Specify the end of the range in which to interpolate.
     * @param {number} ratio Specify the value to use to interpolate between x and y. 值域：[0,1]
     * @returns
     * @memberof JSHelper
     */
    static Mix(a, b, ratio) {
        return a * (1 - ratio) + b * ratio;
    }



    /**
     * 将返回值限定在指定数值范围之内(右边界可取)
     *
     * @static
     * @param {Number} value
     * @param {Number} min 最小值
     * @param {Number} max 最大值(可取到)
     * @return {Number} 
     * @memberof JSHelper
     */
    static Clamp(value, min, max = Number.MAX_SAFE_INTEGER) {
        return value < min ? min : (value > max ? max : value);
    }

    //#endregion

    //#region IO

    /**
    * 异步ajax请求
    *
    * @static
    * @param {string} url http数据链接
    * @param {string} method HTTP方法,目前支持："GET","POST"
    * @param {string} responseType 返回类型，目前支持："", "text", "json", "document", "arraybuffer", "blob"
    * @param {string} [params] POST参数,形如查询字符串参数
    * @returns {*}
    * @memberof RequestHelper
    */
    static async RequestAsync(url, method, responseType, params) {
        if (["GET", "POST"].indexOf(method) == -1)
            throw new Error(`method ${method} not supported`);

        if (["", "text", "json", "document", "arraybuffer", "blob"].indexOf(responseType) == -1)
            throw new Error(`responseType ${responseType} not supported`);

        let promise = new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");//url编码方式存储post参数
            xhr.responseType = responseType;
            xhr.onload = (e) => {
                resolve(e.target.response);
            }
            xhr.onerror = (e) => {
                reject(e.target.statusText);
            }
            xhr.send(method == "GET" ? null : params);
        });
        let result = (await Promise.all([promise]))[0];
        return result;
    }

    /**
     * 将JS对象下载为文件
     *
     * @static
     * @param {*} obj 
     * @param {string} fileName 保存的文件名
     * @memberof BagHelper
    */
    static DownLoadObj(obj, fileName) {
        let content = JSHelper.IsObject(obj) ? JSON.stringify(obj) : obj;
        fileName = JSHelper.IsString(fileName) && fileName.length > 0 ? fileName : JSHelper.GenerateGUID();

        let link = document.createElement("a");
        link.style = "display:none";
        link.download = fileName;


        //匹配图片
        let isImageDataUri = false;
        if (typeof (obj) === "string") {
            let pattern = new RegExp("^data:image/(?:png|jpeg|webp){1};base64,");
            isImageDataUri = pattern.test(obj);
        }

        if (isImageDataUri) {
            link.href = obj;
        }
        else {
            let blob = new Blob([content]);
            link.href = URL.createObjectURL(blob);
        }

        let event = new MouseEvent("click");
        link.dispatchEvent(event);//分发点击事件
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
    }
    //#endregion



    //#region  DOM


    /**
     * 根据id或element返回html element 实例(若指定id的dom不存在，则创建)
     *
     * @static
     * @param {String|HTMLElement} element 
     * @return {*} 
     * @memberof JSHelper
     */
    static GetElement(element) {
        if (typeof element === "string") {
            const foundElement = document.getElementById(element);
            if (foundElement === null) {
                throw new Error(
                    `Element with id "${element}" does not exist in the document.`
                );
            }
            element = foundElement;
        }
        if (!(element instanceof HTMLElement))
            throw new Error(`element is not instance of HTMLElement:a HTMLElement  or element id required`);

        return element
    }

    //#endregion



    /**
      * 深度拷贝对象
      * @static
      * @param {*} data 要深度拷贝的源数据
      * @param {boolean} skipFun 标识克隆时是否跳过函数类型成员
      * @returns {*} 
      * @memberof JSHelper
    */
    static DeepClone(data, skipFun) {
        let newOne;
        if (JSHelper.IsArray(data)) {
            newOne = new Array(data.length);
            for (let i = 0; i < data.length; i++) {
                newOne[i] = JSHelper.DeepClone(data[i]);
            }
            return newOne;
        }
        else if (JSHelper.IsObject(data)) {
            newOne = {};
            skipFun = JSHelper.IsFunction(skipFun) ? skipFun : false;
            for (let key in data) {
                if (skipFun && this.isFunction(data[key])) {
                    continue;
                }
                newOne[key] = JSHelper.DeepClone(data[key]);
            }
            newOne.__proto__ = data.__proto__;
            return newOne;
        }
        else {
            return data;
        }
    }


    /**
    * 生成GUID
    *
    * @static
    * @returns {string}
    * @memberof BagHelper
    */
    static GenerateGUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0;
            let v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }


    /**
     * 获取数组深度(仅检查第一项)
     *
     * @static
     * @param {Array} arr 待检测数组
     * @param {integer} [depth] 深度起始值
     * @returns {integer}
     * @memberof BagHelper
     */
    static GetArrayDepth(arr, depth) {
        depth = JSHelper.IsInteger(depth) ? depth : 0;
        if (Array.isArray(arr)) {
            ++depth;
            if (arr.length > 0)
                return JSHelper.GetArrayDepth(arr[0], depth);
        }
        return depth;
    }

    /**
     * 判定对象是否非空(undefined+null判断)
     *
     * @static
     * @param {*} value
     * @return {*} 
     * @memberof JSHelper
     */
    static Defined(value) {

        return value !== undefined && value !== null;
    }


    static GetQueryParams(url) {
        return (url.match(/([^?=&]+)(=([^&]*))/g) || []).reduce(
            (a, v) => (
                (a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), a
            ),
            {}
        );
    }

    // static GetAllQueryParams(url) {
    //     let arrObj = url.split("?");
    //     let params = Object.create(null)
    //     if (arrObj.length > 1) {
    //         arrObj = arrObj[1].split("&");
    //         arrObj.forEach(item => {
    //             item = item.split("=");
    //             params[item[0]] = item[1]
    //         })
    //     }
    //     return params;
    // }
}

export { JSHelper }