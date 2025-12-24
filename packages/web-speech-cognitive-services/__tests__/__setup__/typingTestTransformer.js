// Notes: to test changes in this file, run "jest" with "--no-cache" argument.

const run = ({ filename }) => {
  const escapeStringRegexp = require('escape-string-regexp');
  const fs = require('fs/promises');
  const { extname } = require('path');
  const typeScript = require('typescript');

  const TS_EXPECT_ERROR = /(\/\/\s+)(@ts-expect-error)[\s+(.*)]/gu;
  /** @type {import('typescript').CompilerOptions} */
  const TSCONFIG = {
    allowImportingTsExtensions: true,
    allowSyntheticDefaultImports: true,
    jsx: typeScript.JsxEmit.React,
    lib: ['lib.dom.d.ts', 'lib.esnext.d.ts'],
    module: typeScript.ModuleKind.ESNext,
    moduleResolution: typeScript.ModuleResolutionKind.Bundler,
    noEmit: true,
    skipLibCheck: true,
    strict: true,
    target: typeScript.ScriptTarget.ESNext,
    types: []
  };

  async function compile(filename) {
    const program = typeScript.createProgram([filename], TSCONFIG);

    const emitResult = program.emit();
    const allDiagnostics = typeScript.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    allDiagnostics.forEach(({ file, messageText, start }) => {
      if (file && start) {
        const { line, character } = file.getLineAndCharacterOfPosition(start);
        const message = typeScript.flattenDiagnosticMessageText(messageText, '\n');

        throw new Error(`Failed to compile ${file.fileName} (${line + 1},${character + 1}): ${message}`);
      } else {
        throw new Error(typeScript.flattenDiagnosticMessageText(messageText, '\n'));
      }
    });
  }

  async function checkExpectError(filename) {
    const sourceText = await fs.readFile(filename, 'utf-8');
    const sourceTextWithoutExpectError = sourceText.replace(TS_EXPECT_ERROR, '$1');

    const extension = extname(filename);
    const tempFilename = filename.substring(0, filename.length - extension.length) + `.tmp${extension}`;

    await fs.writeFile(tempFilename, sourceTextWithoutExpectError);

    try {
      const program = typeScript.createProgram([tempFilename], TSCONFIG);

      const emitResult = program.emit();
      const allDiagnostics = typeScript.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

      allDiagnostics.forEach(({ file, messageText, start }) => {
        if (file && start) {
          const { line } = file.getLineAndCharacterOfPosition(start);
          const message = typeScript.flattenDiagnosticMessageText(messageText, '\n');

          const expectedErrorLine = file.getFullText().split('\n')[line - 1];
          const expectedError = expectedErrorLine?.replace(/\s*\/\/\s+/u, '').trim();
          let expectedErrors = [expectedError];

          try {
            const parsed = JSON.parse(expectedError);

            if (Array.isArray(expectedErrors) && expectedErrors.every(value => typeof value === 'string')) {
              expectedErrors = parsed;
            }
          } catch {}

          expect(message).toEqual(expect.stringMatching(new RegExp(expectedErrors.map(escapeStringRegexp).join('|'))));
        } else {
          throw new Error(typeScript.flattenDiagnosticMessageText(messageText, '\n'));
        }
      });
    } finally {
      fs.unlink(tempFilename);
    }
  }

  describe(filename, () => {
    test('should succeed', () => compile(filename));
    test('should have @ts-expect-error describing compile errors correctly', () => checkExpectError(filename));
  });
};

module.exports = {
  process(_, filename) {
    return { code: `(${run})(${JSON.stringify({ filename })})` };
  }
};
