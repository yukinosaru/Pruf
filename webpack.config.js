var path = require('path');
var webpack = require('webpack');
var SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

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
                'dist/images/**.*',
                'dist/scripts/**.js',
                'dist/scripts/sw/**.js',
                'dist/styles/**.css',
            ],
            stripPrefix: 'dist/',
            staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
          }
        )
     ]
};