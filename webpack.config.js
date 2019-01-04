const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    'ts-di-transformer.umd': path.join(__dirname, 'src.bundle/index.ts'),
    'ts-di-transformer.umd.min': path.join(__dirname, 'src.bundle/index.ts'),
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'bundles'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'ts-di-transformer',
    umdNamedDefine: true
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  devtool: 'source-map',
  mode: 'development',
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true,
        include: /\.min\.js$/
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "awesome-typescript-loader",
          options: {
            useTranspileModule: true
          }
        }
      }
    ]
  }
};