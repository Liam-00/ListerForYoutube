import path from "node:path"
import HtmlWebpackPlugin from "html-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"


export default { 
    entry: ["/src/index.jsx", "/src/app.js"],
    output: {
        path: path.join(process.cwd(), '/dist'),
        
    },
    devServer: {
      static: {
        directory: path.join(process.cwd(), '/dist')
      },
      port: 9000
    },
    devtool: 'eval-source-map',
    module: {
        rules: [
          {
            test: /\.jsx$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-react', { targets: "defaults" }]
                ]
              }
            }
          },
          {
            test: /\.json$/,
            type: 'asset/resource'
          }
          {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader']
          },
          {
            test: /\.(png|svg|jpg|jpeg|gif|svg#.*)$/i,
            type: 'asset/resource',
            generator: {
              outputPath: 'icons/'
            }
          },
          {
            test: /\.html$/,
            use: ['html-loader']
          }
        ]
      },
      plugins: [
        new HtmlWebpackPlugin({
          template: "src/index.html"
        }),
        new MiniCssExtractPlugin()
      ],
      performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
}