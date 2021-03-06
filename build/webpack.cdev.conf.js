var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

module.exports = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.cdev.cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.cdev.env
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'invite.html',
      template: 'invite.html',
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'login.html',
      template: 'login.html',
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'signup.html',
      template: 'signup.html',
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'recover-with-login.html',
      template: 'recover-with-login.html',
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'recover-with-mobile.html',
      template: 'recover-with-mobile.html',
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'validate-otp.html',
      template: 'validate-otp.html',
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'reset-password.html',
      template: 'reset-password.html',
      inject: true
    }),
    new FriendlyErrorsPlugin()
  ]
})
