const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    open: '/',
    static: [
      {
        directory: './dist',
        publicPath: '/dist'
      },
      {
        directory: './css',
        publicPath: '/css'
      },
      {
        directory: './node_modules/dwv',
        publicPath: '/node_modules/dwv'
      },
      {
        directory: './node_modules/konva',
        publicPath: '/node_modules/konva'
      },
      {
        directory: './node_modules/jszip',
        publicPath: '/node_modules/jszip'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html'
    }),
  ]
});