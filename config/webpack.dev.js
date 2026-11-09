import {merge} from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import {common} from './webpack.common.js';

export default merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    open: '/',
    static: [
      {
        directory: './demo',
        publicPath: '/'
      },
      {
        directory: './node_modules/dwv/dist/assets',
        publicPath: '/assets'
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'demo/index.html',
      scriptLoading: 'module',
    }),
  ]
});