module.exports = {
  setupFilesAfterEnv: ['./utils/setupDotEnv.js', './utils/setupGlobalAgent.js', './utils/setupFetchPolyfill.js'],
  testEnvironment: 'node',
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(uuid)/)']
};
