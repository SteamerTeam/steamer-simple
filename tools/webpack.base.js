'use strict';

const path = require('path'),
      utils = require('steamer-webpack-utils'),
      webpack = require('webpack'),
      webpackMerge = require('webpack-merge'),
      customConfig = require('../config/webpack.custom');

var config = require('../config/project'),
    configWebpack = config.webpack;

var CopyWebpackPlugin = require("copy-webpack-plugin-hash");

var baseConfig = {
    context: configWebpack.path.src,
    entry: configWebpack.entry,
    output: {
        publicPath: config.webserver,
        path: configWebpack.path.dev,
        filename: configWebpack.chunkhashName + ".js",
        chunkFilename: "chunk/" + configWebpack.chunkhashName + ".js",
    },
    module: {
        rules: [
            { 
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    // verbose: false,
                    cacheDirectory: './.webpack_cache/',
                    presets: [
                        ["es2015", {"loose": true}],
                    ]
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    { loader: 'style-loader' },
                    {
                        loader: 'css-loader',
                        options: {
                            localIdentName: '[name]-[local]-[hash:base64:5]',
                            root: configWebpack.path.src
                            // module: true
                        }
                    },
                    { loader: 'postcss-loader' },
                ]
            },
            {
                test: /\.less$/,
                use: [
                    { loader: 'style-loader' },
                    {
                        loader: 'css-loader',
                        options: {
                            localIdentName: '[name]-[local]-[hash:base64:5]',
                            // module: true
                        }
                    },
                    { loader: 'postcss-loader' },
                    {
                        loader:  'less-loader',
                        options: {
                            root: configWebpack.path.src
                        }
                    }
                ]
            },
            {
                test: /\.styl$/,
                use: [
                    { loader: 'style-loader' },
                    {
                        loader: 'css-loader',
                        options: {
                            localIdentName: '[name]-[local]-[hash:base64:5]',
                            // module: true
                        }
                    },
                    { loader: 'postcss-loader' },
                    { loader: 'stylus-loader', }
                ]
            },
            {
                test: /\.pug$/, 
                loader: 'pug-loader'
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
                loader: "url-loader",
                options: {
                    limit: 1000,
                    name: "img/[path]/" + configWebpack.hashName + ".[ext]"
                },
                include: configWebpack.path.src
            },
            {
                test: /\.ico$/,
                loader: "url-loader",
                options: {
                    name: "[name].[ext]"
                },
                include: configWebpack.path.src
            },
        ],
    },
    resolve: {
        modules: [
            configWebpack.path.src,
            "node_modules"
        ],
        extensions: [".js", ".jsx", ".css", ".scss", ".less", ".styl", ".png", ".jpg", ".jpeg", ".ico", ".ejs", ".pug", ".handlebars"],
        alias: {
            'utils': path.join(configWebpack.path.src, '/js/common/utils'),
            'sutils': 'steamer-browserutils/index',
        }
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new CopyWebpackPlugin([
            {
                from: 'libs/',
                to: 'libs/' + configWebpack.hashName + '.[ext]'
            }
        ]),
    ],
};

var finalConfig = webpackMerge.smartStrategy({
    "module.rules": "prepend"
})(baseConfig, customConfig);

module.exports = finalConfig;