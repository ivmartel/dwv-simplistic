import path from 'path';
import {fileURLToPath} from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const common = {
  entry: {
    dwvsimplistic: './src/index.js'
  },
  output: {
    // main bundle output
    filename: '[name].min.js',
    library: {
      type: 'module'
    },
    environment: {
      module: true
    },
    path: path.resolve(__dirname, 'dist'),
    // clean output folder at each build
    clean: true,
  },
  experiments: {
    // module is still experimental
    outputModule: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader']
      }
    ]
  }
};