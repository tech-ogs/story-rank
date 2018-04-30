var utils = require('./utils')
var config = require('../config')
var isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  loaders: Object.assign(
    {          
      js: {
         loader: 'babel-loader',
         options: { presets : [ 'env' ] }
      }
    },
    utils.cssLoaders({
      sourceMap: isProduction
        ? config.build.productionSourceMap
        : config.dev.cssSourceMap,
      extract: isProduction
    })
  ),
  transformToRequire: {
    video: 'src',
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
