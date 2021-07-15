module.exports = {
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-runtime',
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
