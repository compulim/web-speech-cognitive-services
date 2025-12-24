import { defineConfig } from 'tsup';

export default defineConfig([
  {
    dts: true,
    entry: {
      'web-speech-cognitive-services': './src/index.ts'
    },
    format: ['cjs', 'esm'],
    sourcemap: true,
    target: 'esnext'
  }
]);
