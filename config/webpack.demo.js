import path from 'path';
import {readFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {merge} from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

import prod from './webpack.prod.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// demo: full static site in build/ (bundle in build/dist)
export default merge(prod, {
  output: {
    path: path.resolve(__dirname, '../build/dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      // enable the service worker (not in dev)
      templateContent: readFileSync('demo/index.html', 'utf8').replace(
        /<!-- register-sw .*-->/,
        '<script src="register-sw.js"></script>'
      ),
      filename: '../index.html',
      scriptLoading: 'module',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'demo',
          to: '..',
          globOptions: {ignore: ['**/index.html']},
        },
        {from: 'license.txt', to: '..'},
        {from: 'readme.md', to: '..'},
      ],
    }),
  ],
});
