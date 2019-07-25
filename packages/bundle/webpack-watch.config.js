const webpackConfig = require('./webpack-instrumented.config');

module.exports = {
  ...webpackConfig,
  stats: {
    assets: false,
    builtAt: false,
    chunks: false,
    colors: true,
    hash: false,
    modules: false,
    version: false,
    warnings: false
  }
};
