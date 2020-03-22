module.exports = {
  setupFilesAfterEnv: [
    './utils/setupGlobalAgent.js',
    './utils/setupFetchPolyfill.js'
  ],
  testEnvironment: 'node'
};
