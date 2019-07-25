const webpackConfig = require('./webpack.config');

// In order to pack instrumented build, make sure you are using Babel with NODE_ENV=TEST.
// This configuration file only change the entrypoints and will not add any instrumentation code.

module.exports = {
  ...webpackConfig,
  entry: {
    'web-speech-cognitive-services.development': './lib/index.js'
  },
  mode: 'development'
};
