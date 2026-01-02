import { defineConfig, type Options } from 'tsup';
import overrideConfig from './tsup.config.override.ts';

const baseConfig: Options = {
  dts: true,
  entry: {
    'web-speech-cognitive-services': './src/index.ts'
  },
  sourcemap: true
};

export default defineConfig([
  overrideConfig({
    ...baseConfig,
    format: ['esm'],
    target: 'esnext'
  }),
  overrideConfig({
    ...baseConfig,
    format: ['cjs'],
    target: 'es2019' // For compatibility with Webpack 4.
  })
]);
