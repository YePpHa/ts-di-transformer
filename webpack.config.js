const interfaceTransformer = require('./transformer/interface');
const path = require('path');

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    app: path.join(__dirname, 'src/app.ts'),
  },
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, 'dist')
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "awesome-typescript-loader",
          options: {
            getCustomTransformers: program => ({
              before: [
                interfaceTransformer(program)
              ]
            })
          }
        }
      }
    ]
  }
};