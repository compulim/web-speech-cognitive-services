module.exports = {
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: '3',
        version: '7.17.2'
      }
    ]
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: 'last 2 versions, not ie <= 11',
        modules: 'commonjs'
      }
    ]
  ]
};
