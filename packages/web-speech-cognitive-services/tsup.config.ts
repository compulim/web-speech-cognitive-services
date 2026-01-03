import { defineConfig, type Options } from 'tsup';

const baseConfig: Partial<Options> = {
  define: {
    'process.env.npm_package_version': `'${process.env.npm_package_version}'`
  }
};

export default defineConfig([
  {
    ...baseConfig,
    dts: true,
    entry: {
      'web-speech-cognitive-services': './src/index.js'
    },
    format: ['cjs', 'esm'],
    sourcemap: true,
    target: ['esnext']
  },
  {
    ...baseConfig,
    entry: {
      'web-speech-cognitive-services': './src/index.umd.js'
    },
    format: ['iife'],
    minify: true,
    outExtension: () => ({ js: '.production.min.js' }),
    platform: 'browser',
    sourcemap: true,
    target: ['chrome100', 'edge100', 'firefox100', 'safari16']
  },
  {
    ...baseConfig,
    entry: {
      'web-speech-cognitive-services': './src/index.umd.js'
    },
    format: ['iife'],
    outExtension: () => ({ js: '.development.js' }),
    platform: 'browser',
    sourcemap: true,
    target: ['chrome100', 'edge100', 'firefox100', 'safari16']
  }
]);
