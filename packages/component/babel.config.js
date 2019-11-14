module.exports = {
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    "@babel/plugin-transform-runtime",
    [
      'transform-inline-environment-variables', {
        include: [
          'NPM_PACKAGE_VERSION'
        ]
      }
    ]
  ],
  presets: [
    ['@babel/preset-env', {
      // forceAllTransforms: true,
      modules: 'commonjs',
      targets: 'last 2 version, not ie <= 11'
    }]
  ]
}
