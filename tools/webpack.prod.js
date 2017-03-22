'use strict';

const path = require('path'),
      utils = require('steamer-webpack-utils'),
      os = require('os'),
      webpack = require('webpack');

var config = require('../config/project'),
    configWebpack = config.webpack;

var HtmlResWebpackPlugin = require('html-res-webpack-plugin'),
    Clean = require('clean-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin-steamer"),
    CopyWebpackPlugin = require("copy-webpack-plugin-hash"),
    WebpackMd5Hash = require('webpack-md5-hash'),
    UglifyJsParallelPlugin = require('webpack-uglify-parallel'),
    HappyPack = require('happypack'),
    SpritesmithPlugin = require('webpack-spritesmith'),
    PostcssImport = require('postcss-import'),
    Autoprefixer = require('autoprefixer');

var prodConfig = {
    entry: configWebpack.entry,
    output: {
        publicPath: config.cdn,
        path: path.join(configWebpack.path.dist, "cdn"),
        filename: "[name]-" + configWebpack.chunkhash + ".js",
        chunkFilename: "chunk/[name]-" + configWebpack.chunkhash + ".js",
    },
    module: {
        loaders: [
            { 
                test: /\.js$/,
                 loader: 'happypack/loader?id=jsHappy',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                // 单独抽出样式文件
                loader: ExtractTextPlugin.extract('style', 'css'),
                include: path.resolve(configWebpack.path.src)
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style-loader!css-loader?-autoprefixer&localIdentName=[name]-[local]-[hash:base64:5]!postcss-loader!less-loader?root=' + path.resolve('src')),
            },
            {
                test: /\.styl$/,
                loader: ExtractTextPlugin.extract('style-loader!css-loader?-autoprefixer&localIdentName=[name]-[local]-[hash:base64:5]!postcss-loader!stylus-loader'),
            },
            {
                test: /\.ejs$/, 
                loader: 'ejs-compiled?htmlmin'
            },
            {
                test: /\.jade$/, 
                loader: 'jade'
            },
            { 
                test: /\.handlebars$/, 
                loader: "handlebars-loader" 
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    "url-loader?limit=1000&name=img/[path]/[name]-" + configWebpack.hash + ".[ext]",
                    // 压缩png图片
                    // 'image-webpack?{progressive:true, optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}}'
                ],
                include: path.resolve(configWebpack.path.src)
            },
            {
                test: /\.ico$/,
                loader: "url-loader?name=[name].[ext]",
                include: path.resolve(configWebpack.path.src)
            },
        ],
        noParse: [
            
        ]
    },
    'ejs-compiled-loader': {
        'htmlmin': true, // or enable here  
        'htmlminOptions': {
            removeComments: true
        }
    },
    resolve: {
    	root: [
            path.resolve(configWebpack.path.src)
        ],
        moduledirectories:['node_modules', configWebpack.path.src],
        extensions: ["", ".js", ".jsx", ".es6", "css", "scss", "less", ".styl", "png", "jpg", "jpeg", "ico", ".ejs"],
        alias: {
        	'utils': path.join(configWebpack.path.src, '/js/common/utils'),
            'sutils': 'steamer-browserutils/index',
            'net': 'steamer-net/index',
        }
    },
    plugins: [
        // remove previous dist folder
        new Clean(['dist'], {root: path.resolve()}),
        // inject process.env.NODE_ENV so that it will recognize if (process.env.NODE_ENV === "__PROD__")
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify(config.env)
            }
        }),
        new CopyWebpackPlugin([
		    {
		        from: 'src/libs/',
		        to: 'libs/[name]-' + configWebpack.hash + '.[ext]'
		    }
		]),
        new HappyPack({
            id: 'jsHappy',
            verbose: false,
            loaders: [{
                path: 'babel',
                query: {
                    cacheDirectory: './.webpack_cache/',
                    presets: [
                        ["es2015", {"loose": true}],
                    ]
                },
            }],
        }),
        new webpack.optimize.OccurrenceOrderPlugin(true),
        new ExtractTextPlugin("./css/[name]-" + configWebpack.contenthash + ".css", {filenamefilter: function(filename) {
            // 由于entry里的chunk现在都带上了js/，因此，这些chunk require的css文件，前面也会带上./js的路径
            // 因此要去掉才能生成到正确的路径/css/xxx.css，否则会变成/css/js/xxx.css
            return filename.replace('/js', '');
        }}),
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     }
        // }),
        new UglifyJsParallelPlugin({
            workers: os.cpus().length, // usually having as many workers as cpu cores gives good results 
            // other uglify options 
            compress: {
                warnings: false,
            },
        }),
        new WebpackMd5Hash(),
        new webpack.NoErrorsPlugin(),
    ],
    watch: false, //  watch mode
};

configWebpack.html.forEach(function(page, key) {
    utils.addPlugins(prodConfig, HtmlResWebpackPlugin, {
        mode: "html",
        filename: "../webserver/" + page + ".html",
        template: "src/" + page + ".html",
        favicon: "src/favicon.ico",
        entryLog: !key ? true : false,
        htmlMinify: {
            removeComments: true,
            collapseWhitespace: true,
        }
    });
}); 

configWebpack.sprites.forEach(function(folder) {
    utils.addPlugins(prodConfig, SpritesmithPlugin, {
        src: {
            cwd: path.join(configWebpack.path.src, "img/sprites/" + folder),
            glob: '*.png'
        },
        target: {
            image: path.join(configWebpack.path.src, "css/sprites/sprite-" + folder + ".png"),
            css: path.join(configWebpack.path.src, "css/sprites/sprite-" + folder + ".less")
        },
        spritesmithOptions: {
            padding: 10
        },
        customTemplates: {
            'less': path.resolve(__dirname, './sprite-template/less.template.handlebars'),
        },
        apiOptions: {
            cssImageRef: "sprite-" + folder + ".png"
        }
    });
});

module.exports = prodConfig;