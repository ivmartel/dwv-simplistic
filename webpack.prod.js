import {merge} from 'webpack-merge';

import {common} from './webpack.common.js';

export default merge(common, {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  externals: {
    dwv: 'dwv'
  }
});
