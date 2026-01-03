import { readFile } from 'node:fs/promises';
import { registerHooks } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const stub = (await readFile(resolve(fileURLToPath(import.meta.url), '../test-types.stub.mts'))).toString();

registerHooks({
  load(
    /** @type {string} */
    url,
    context,
    nextLoad
  ) {
    // Could be file: or node:.
    if (new URL(url).protocol === 'file:') {
      const filename = resolve(fileURLToPath(url));

      // Could be loading /node_modules/.
      if (filename.endsWith('.test-types.ts')) {
        return {
          format: 'module-typescript',
          shortCircuit: true,
          source: `const FILENAME=${JSON.stringify(filename)};\n${stub}`
        };
      }
    }

    return nextLoad(url, context);
  }
});
