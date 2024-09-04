const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  useBuiltIns: false
                }
              ]
            ]
          }
        }
      }
    ]
  },
  externals: {
    dwv: {
      root: 'dwv',
      commonjs: 'dwv',
      commonjs2: 'dwv',
      amd: 'dwv'
    }
  }
});