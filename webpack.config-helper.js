"use strict";

const Path = require("path");
const Webpack = require("webpack");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const ExtractSASS = new ExtractTextPlugin("styles/bundle.css");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = options => {
  const dest = Path.join(__dirname, "dist");

  let webpackConfig = {
    mode: options.mode,
    devtool: options.devtool,
    entry: ["babel-polyfill", "./src/scripts/index"],
    output: {
      path: dest,
      filename: "bundle.[hash].js"
    },
    plugins: [
      new Webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify(
            options.isProduction ? "production" : "development"
          )
        }
      }),
      new HtmlWebpackPlugin({
        template: "./src/index.html"
      }),
      new CleanWebpackPlugin([dest])
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["es2015"]
            }
          }
        }
      ]
    }
  };

  if (options.isProduction) {
    webpackConfig.entry = ["./src/scripts/index"];

    webpackConfig.plugins.push(
      new UglifyJSPlugin({
        sourceMap: true
      }),
      ExtractSASS,
      new OptimizeCssAssetsPlugin({
        cssProcessor: require("cssnano"),
        cssProcessorOptions: {
          map: {
            inline: false
          },
          discardComments: {
            removeAll: true
          }
        },
        canPrint: true
      }),
      new FaviconsWebpackPlugin({
        // Your source logo
        logo: "./src/assets/icon.png",
        // The prefix for all image files (might be a folder or a name)
        prefix: "icons-[hash]/",
        // Generate a cache file with control hashes and
        // don't rebuild the favicons until those hashes change
        persistentCache: true,
        // Inject the html into the html-webpack-plugin
        inject: true,
        // favicon background color (see https://github.com/haydenbleasel/favicons#usage)
        background: "#fff",
        // favicon app title (see https://github.com/haydenbleasel/favicons#usage)
        title: "test",

        // which icons should be generated (see https://github.com/haydenbleasel/favicons#usage)
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: true,
          coast: false,
          favicons: true,
          firefox: true,
          opengraph: false,
          twitter: false,
          yandex: false,
          windows: false
        }
      })
    );

    webpackConfig.module.rules.push(
      {
        test: /\.s?css/i,
        use: ExtractSASS.extract([
          "css-loader?sourceMap=true&minimize=true",
          "sass-loader",
          "postcss-loader"
        ])
      },
      {
        // Load all images as base64 encoding if they are smaller than 8192 bytes
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              name: "[name].[hash:20].[ext]",
              limit: 8192
            }
          }
        ]
      }
    );
  } else {
    webpackConfig.plugins.push(new Webpack.HotModuleReplacementPlugin());

    webpackConfig.module.rules.push(
      {
        test: /\.s?css$/i,
        use: ["style-loader", "css-loader?sourceMap=true", "sass-loader"]
      },
      {
        test: /\.js$/,
        use: "eslint-loader",
        exclude: /node_modules/
      },
      {
        // Load all images as base64 encoding if they are smaller than 8192 bytes
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              // On development we want to see where the file is coming from, hence we preserve the [path]
              name: "[path][name].[ext]?hash=[hash:20]",
              limit: 8192
            }
          }
        ]
      }
    );

    webpackConfig.devServer = {
      contentBase: dest,
      watchContentBase: true,
      hot: true,
      port: options.port,
      inline: true
    };
  }

  return webpackConfig;
};
