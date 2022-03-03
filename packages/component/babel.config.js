module.exports = {
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3,
        version: '7.17.2'
      }
    ],
    [
      'babel-plugin-transform-inline-environment-variables',
      {
        include: ['npm_package_version']
      }
    ]
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        // forceAllTransforms: true,
        modules: 'commonjs',
        targets: 'last 2 version, not ie <= 11'
      }
    ]
  ]
};
