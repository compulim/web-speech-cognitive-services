const { resolve } = require('path');
const { StatsWriterPlugin } = require('webpack-stats-plugin');

module.exports = {
  entry: {
    'web-speech-cognitive-services.production.min': './lib/index.js'
  },
  mode: 'production',
  output: {
    filename: '[name].js',
    library: 'WebSpeechCognitiveServices',
    libraryTarget: 'umd',
    path: resolve(__dirname, 'dist')
  },
  plugins: [
    new StatsWriterPlugin({
      filename: 'stats.json',
      transform: (_, opts) => JSON.stringify(opts.compiler.getStats().toJson({ chunkModules: true }), null, 2)
    })
  ]
};
