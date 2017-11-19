var path = require('path');
var webpack = require('webpack');
var SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
    entry: path.resolve(__dirname,'src/main.js'),
    output: {
        path: path.resolve(__dirname,'dist/'),
        filename: '[name].bundle.js',
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ["es2015","react"]
                }
            },
            {
                test: /\.css/,
                loader: [ 'style-loader', 'css-loader' ]
            }
        ],
    },
    plugins: [
        new SWPrecacheWebpackPlugin(
          {
            cacheId: 'prüf',
            filename: 'service-worker.js',
            minify: true,
            staticFileGlobs: [
                'dist/**.html',
                'dist/**.js',
                'dist/images/**.*',
                'dist/images/drawable-mdpi/**.*',
                'dist/scripts/**.js',
                'dist/scripts/sw/**.js',
                'dist/styles/**.css',
                'favicon.ico'
            ],
            stripPrefix: 'dist/',
            staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
          }
        ),
        //new BundleAnalyzerPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0
        }),
        new webpack.optimize.UglifyJsPlugin(), //minify everything
        new webpack.optimize.AggressiveMergingPlugin()//Merge chunk
     ]
};