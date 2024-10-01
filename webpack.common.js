const path = require('path');

module.exports = {
  entry: {
    dwvsimplistic: './src/index.js'
  },
  output: {
    filename: '[name].min.js',
    library: {
      name: '[name]',
      type: 'umd'
    },
    globalObject: 'this',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
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