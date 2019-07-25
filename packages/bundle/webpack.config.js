const { resolve } = require('path');
const Visualizer = require('webpack-visualizer-plugin');

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
  plugins: [new Visualizer()]
};
