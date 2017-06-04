var express = require('express');
var app = express();
var webpack = require('webpack');
var webpackDevMiddleware = require("webpack-dev-middleware");
var webpackHotMiddleware = require("webpack-hot-middleware");
var proxy = require('http-proxy-middleware');

var webpackConfig = require("./webpack.base.js"),
	config = require("../config/project"),
	configWebpack = config.webpack,
	port = configWebpack.port,
	route = Array.isArray(configWebpack.route) ? configWebpack.route : [configWebpack.route];

for (var key in webpackConfig.entry) {
	webpackConfig.entry[key].push('webpack-hot-middleware/client');
}

var compiler = webpack(webpackConfig);
app.use(webpackDevMiddleware(compiler, {
    hot: true,
	historyApiFallback: true,
	noInfo: true,
	stats: { 
		colors: true 
	},
}));
app.use(webpackHotMiddleware(compiler));

// 转发
route.forEach((rt) => {
	app.use(rt, proxy({target: `http://127.0.0.1:${port}`, pathRewrite: {[`^${rt}`] : '/'}}));
});

app.listen(port, function(err) {
	if (err) {
		console.error(err);
	}
	else {
		console.info("Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port);
	}
});