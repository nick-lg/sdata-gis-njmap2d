import path from "path";
import json from 'rollup-plugin-json';
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copyTo from "rollup-plugin-copy-assets-to";
import replace from '@rollup/plugin-replace';
import postcss from "rollup-plugin-postcss";
import image from "@rollup/plugin-image"

export default
    {
        external: [
            "jquery",
            "cesium",
            // "react",
            // "react-dom",
            // // "react-svg",
            // "antd",
            // // "antd/dist/antd.css",
            // // "@nick-wilde/mvt-imagery-provider"
        ],
        input: ["./source/index.js"],//打包的起点文件
        output: {
            file: './build/sdata-gis-njmap.js',//打包的输出文件
            // dir: "./build",
            // inlineDynamicImports: true,
            format: 'iife',
            name: "__sdg_module",
            indent: '\t',////用于表示缩进的字符
            sourcemap: false,
            banner: 'console.info(`sdata-gis-njmap@${new Date().getFullYear()}`)',
            // assetFileNames: "[name][extname]",
            globals: {
                antd: "antd",
                react: 'React',
                'react-dom': 'ReactDOM'
            }
        },
        watch: {
            //限定监控范围
            include: "./source/**"
        },
        //使用的插件
        plugins: [
            replace({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            }),

            json(),
            resolve(),
            babel({
                exclude: 'node_modules/**',
                extensions: [".js", ".ts"],
                // include:"./node_modules/babel-runtime/**",
                runtimeHelpers: true,
                // externalHelpers: true
            }),
            commonjs(
                {
                    // include: "./node_modules/**"
                    // include: "./libs/jquery-3.3.1.js"
                    // include:"./node_modules/@babel/**"
                    include: [
                        "./node_modules/**",
                        "./libs/heatmap.js",
                        // "./libs/mapbox-gl.js"
                    ]
                }),
            //图片处理
            image(),
            //样式打包
            postcss({
                extract: path.resolve('./build/assets/style/sdata-gis-njmap.css'),
                plugins: [],
                // exclude: path.resolve("./node_modules/antd/dist/antd.css")
            }),

            // postcss({
            //     plugins: [
            //       url({
            //         url: "inline", // enable inline assets using base64 encoding
            //         maxSize: 100, // maximum file size to inline (in kilobytes)
            //         fallback: "copy", // fallback method to use if max size is exceeded
            //       }),
            //     ],
            //   }),

            // styles({
            //     // mode: "extract",
            //     // ... or with relative to output dir/output file's basedir (but not outside of it)
            //     mode: ["extract",'assets/styles/sdata-gis.css'],
            //   })


            //静态资源拷贝插件
            copyTo({
                assets: [
                    './node_modules/leaflet/dist/images'
                ],
                outputDir: "./build/assets/style"  //'dist/allAssets'
            }),
            copyTo({
                assets: [
                    './source/config.json'
                ],
                outputDir: "./build"  //'dist/allAssets'
            })
        ],
    }

