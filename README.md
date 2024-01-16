# *Smardaten GIS*
<img src="https://s1.ax1x.com/2022/06/10/X6lCoF.png" alt="Smardaten GIS" width="200"/>


基于Cesium并引入类地图模型的WebGIS平台


## 本地开发环境搭建
1. 安装依赖：
    `npm init`

2. 代码打包(ES6)：
    `npm run build`

3. 示例查看：鼠标右键demos/xxx/xxx.html页面->open with live server(本地需要安装live server插件)。
   

## 使用
+ step1: 引入Cesium(js+css).
+ step2：引入样式文件——./assets/style/sdata-gis.css.
+ setp3：ES6方式引入gis文件——sdata-gis.esm.js.在webpack工程import或直接在type=module的script标签中引入均可.

## 原生ES6使用示例
1. 创建html文件，依次引入Cesium依赖包(js+css)、sdata-gis 样式文件sdata-gis.css.
``` html
<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>sdata-gis-helloWorld</title>

    <!-- cesium -->
    <link rel="stylesheet" href="../../libs/Cesium/Widgets/widgets.css">
    <script src="../../libs/Cesium/Cesium.js"></script>

    <!-- sdata-gis.css -->
    <link rel="stylesheet" href="../../build/assets/style/sdata-gis.css">
    <style>
        html,
        body,
        #mainMap {
            width: 100%;
            height: 100%;
            margin: 0px;
            padding: 0px;
        }
    </style>
</head>
<body>
    <div id="mainMap"></div>
</body>
<script type="module" src="./hello-world.js"></script>
</html>
```

2. 创建js文件
``` js
import { Map } from "../../build/sdata-gis.esm.js"
let map;
window.onload = function () {
     //创建地图实例
    map = new Map("mainMap", 
        {
            baseMap: {
                type:"gaode-street",
            }
        });
}
``` 

3. 鼠标右键demos/hello-world/hello-world.html页面运行hello-world示例
<img src="https://s1.ax1x.com/2022/06/10/X6dzOe.png" alt="demo-hello-world">

## 使用打包器的web工程使用示例
1. 安装sdata-gis开发包： npm install sdata-gis
2. 引入样式和js包

```js
import {Map} from "sdata-gis"// 导入sdata-gis 库文件
import "sdata-gis/build/assets/style/sdata-gis.css"// 导入sdata-gis 样式文件

let map;
window.onload = function () {
    //创建地图实例
    map = new Map("mainMap", 
        {
            baseMap: {
                type:"gaode-street",
            }
        });
}
```


## 相关技术说明
+ 三维数字地球包：[Cesium](https://cesium.com/)
+ 地图组件开发(部分组件)：[React](https://zh-hans.reactjs.org/)
+ 集成打包工具：[rollup.js](https://www.rollupjs.org/guide/en/)














