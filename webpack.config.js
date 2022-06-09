const HtmlWebpackInlineSourcePlugin = require('html-inline-script-webpack-plugin')
const RemovePlugin = require('remove-files-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const path = require('path')

module.exports = (_env, argv) => ({
  // This is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  // watchOptions: {
  //   ignored: /dist/
  // },

  entry: {
    ui: './src/ui/ui.ts', // The entry point for your UI code
    code: './src/code.ts' // The entry point for your plugin code
  },

  module: {
    rules: [
      // Converts TypeScript code to JavaScript
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/]
        }
      },

      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },

      // Enables including CSS by doing "import './file.css'" in your TypeScript code
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'postcss-loader' }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass')
            }
          }
        ]
      },

      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },

      // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
      {
        test: /\.(png|jpg|gif|webp|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              esModule: false
            }
          }
        ]
      }
    ]
  },

  // Webpack tries these extensions for you if you omit the extension like "import './file'"
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      '@': path.resolve('src'),
      assets: path.resolve('src/assets')
    }
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist') // Compile into a folder called "dist"
  },

  // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
  plugins:
    argv.mode === 'production'
      ? [
          new VueLoaderPlugin(),
          new RemovePlugin({
            after: { include: ['dist/ui.js'] }
          }),
          new HtmlWebpackPlugin({
            template: './src/ui/ui.html',
            filename: 'ui.html',
            inlineSource: '.(js|css|scss)$',
            chunks: ['ui']
          }),
          new HtmlWebpackInlineSourcePlugin()
        ]
      : [
          new VueLoaderPlugin(),
          new HtmlWebpackPlugin({
            template: './src/ui/ui.html',
            filename: 'ui.html',
            inlineSource: '.(js|css|scss)$',
            chunks: ['ui']
          }),
          new HtmlWebpackInlineSourcePlugin()
        ]
})
