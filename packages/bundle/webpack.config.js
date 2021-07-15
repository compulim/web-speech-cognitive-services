const { StatsWriterPlugin } = require('webpack-stats-plugin');

module.exports = {
  entry: {
    'web-speech-cognitive-services.production.min': './lib/index.js'
  },
  mode: 'production',
  output: {
    library: 'WebSpeechCognitiveServices',
    libraryTarget: 'umd'
  },
  plugins: [
    new StatsWriterPlugin({
      filename: 'stats.json',
      transform: (_, opts) => JSON.stringify(opts.compiler.getStats().toJson({ chunkModules: true }), null, 2)
    })
  ],
  target: ['web', 'es5']
};
