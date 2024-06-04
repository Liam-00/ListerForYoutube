import path from "node:path"

export default { 
    mode: "development",
    entry: ["/src/index.jsx", "/src/app.js"],
    output: {
        path: path.join(process.cwd(), '/public'),
        filename: "bundle.js"
    },
    watch: true,
    devServer: {
      static: {
        directory: path.join(process.cwd(), '/public')
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
          }
        ]
      }
}