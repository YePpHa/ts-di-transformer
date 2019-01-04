const interfaceTransformer = require('./dist/transformer').default;
const path = require('path');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    app: path.join(__dirname, 'example/app.ts'),
  },
  output: {
    filename: "app.js",
    path: path.join(__dirname, 'dist/example')
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    plugins: [
      new TsConfigPathsPlugin({ configFileName: "./example/tsconfig.json" })
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
            configFileName: "./example/tsconfig.json",
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