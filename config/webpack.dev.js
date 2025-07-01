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
        directory: './public',
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
      template: 'public/index.html',
      scriptLoading: 'module',
    }),
  ]
});