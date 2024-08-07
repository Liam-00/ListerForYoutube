import path from "node:path"
import HtmlWebpackPlugin from "html-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"

export default {
  entry: ["/src/index.tsx", "/src/app.ts"],
  output: {
    path: path.join(process.cwd(), "/dist"),
    clean: true,
  },
  devServer: {
    static: {
      directory: path.join(process.cwd(), "/dist"),
    },
    port: 9000,
  },
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.(tsx|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
      {
        test: /\.(jsx|js)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-react", { targets: "defaults" }],
              "@babel/preset-typescript",
            ],
          },
        },
      },
      {
        test: /\.json$/,
        type: "asset/resource",
        generator: {
          filename: "[name].json",
        },
      },
      {
        test: /\.ttf$/,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name][ext]",
        },
      },
      {
        test: /serviceworker.js/,
        type: "asset/resource",
        generator: {
          filename: "[name][ext]",
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { url: true, import: true } },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|svg#.*)$/i,
        type: "asset/resource",
        generator: {
          filename: "icons/[name][ext]",
        },
      },
      {
        test: /\.html$/,
        use: ["html-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    new MiniCssExtractPlugin(),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
}
