module.exports =
{
    plugins: ["plugins/markdown"],
    recurseDepth: 10,
    sourceType: "module",
    tags: {
        allowUnknownTags: true,
        dictionaries: ["jsdoc", "closure"]
    },
    source: {
        /* array of paths to files to generate documentation for */
        include: ["./source/"],
        exclude: ["./source/assets/"],
        readme: "./README.md"
    },
    opts: {
        template: "node_modules/docdash",
        encoding: "utf8",               // 文件编码
        destination: "./docs/chm/",          // 输出位置
        recurse: true,  
        primary:false               
    },

    templates: {
        default: {
            includeDate: false,
            useLongnameInNav: false,
            outputSourceFiles: false,
        },
        footer:`sdata-gis@${new Date().getFullYear()}` ,
        cleverLinks: false,
        monospaceLinks: false,
    },
    docdash: {
        "static": [false | true],         
        "sort": [false | true],           
        "sectionOrder": [         
            "Classes",
            "Modules",
            "Externals",
            "Events",
            "Namespaces",
            "Mixins",
            "Tutorials",
            "Interfaces"
        ],
        "disqus": "",                   
        "openGraph": {              
            "title": "Title of the website",                
            "type": "website",         
            "image": "./source/assets/image/test.png",                
            "site_name": "Site name",            
            "url": ""                  
        },
        "meta": {                      
            "title": "SmardatenGIS",               
            "description": "Description of overal contents of your website",         
            "keyword": "SmardatenGIS"               
        },
        "search": true,         
        "collapse": true,      
        "wrap": [false | true],           
        "typedefs": [false | true],      
        "navLevel": [0],         
        "private": false,     
        "scripts": [],                 
        scopeInOutputPath: [false | true], // Add scope from package file (if present) to the output path, true by default.
        nameInOutputPath: [false | true], // Add name from package file to the output path, true by default.
        versionInOutputPath: false // Add package version to the output path, true by default.
    },
}