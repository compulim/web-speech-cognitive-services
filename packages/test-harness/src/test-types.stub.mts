import escapeStringRegexp from 'escape-string-regexp';
import { expect } from 'expect';
import { readFileSync } from 'fs';
import { describe, test } from 'node:test';
import {
  createCompilerHost,
  createProgram,
  flattenDiagnosticMessageText,
  getPreEmitDiagnostics,
  JsxEmit,
  ModuleKind,
  ModuleResolutionKind,
  ScriptTarget,
  type CompilerOptions
} from 'typescript';

// Passed when stubbing.
declare global {
  const FILENAME: string;
}

const TS_EXPECT_ERROR = /(\/\/\s+)(@ts-expect-error)[\s+(.*)]/gu;
const TSCONFIG: CompilerOptions = {
  allowImportingTsExtensions: true,
  allowSyntheticDefaultImports: true,
  jsx: JsxEmit.React,
  lib: ['lib.dom.d.ts', 'lib.esnext.d.ts'],
  module: ModuleKind.ESNext,
  moduleResolution: ModuleResolutionKind.Bundler,
  noEmit: true,
  skipLibCheck: true,
  strict: true,
  target: ScriptTarget.ESNext,
  types: []
};

async function compile(filename: string) {
  const program = createProgram([filename], TSCONFIG);

  const emitResult = program.emit();
  const allDiagnostics = getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  allDiagnostics.forEach(({ file, messageText, start }) => {
    if (file && start) {
      const { line, character } = file.getLineAndCharacterOfPosition(start);
      const message = flattenDiagnosticMessageText(messageText, '\n');

      throw new Error(`Failed to compile ${file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      throw new Error(flattenDiagnosticMessageText(messageText, '\n'));
    }
  });
}

async function checkExpectError(filename: string) {
  const host = createCompilerHost({});

  host.readFile = path => readFileSync(path).toString().replace(TS_EXPECT_ERROR, '$1');

  const program = createProgram({ host, options: TSCONFIG, rootNames: [filename] });

  const emitResult = program.emit();
  const allDiagnostics = getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  allDiagnostics.forEach(({ file, messageText, start }) => {
    if (file && start) {
      const { line } = file.getLineAndCharacterOfPosition(start);
      const message = flattenDiagnosticMessageText(messageText, '\n');

      const expectedErrorLine = file.getFullText().split('\n')[line - 1];
      const expectedError = expectedErrorLine?.replace(/\s*\/\/\s+/u, '').trim();
      let expectedErrors = [expectedError];

      try {
        if (expectedError) {
          const parsed = JSON.parse(expectedError);

          if (Array.isArray(expectedErrors) && expectedErrors.every(value => typeof value === 'string')) {
            expectedErrors = parsed;
          }
        }
      } catch {}

      expect(message).toEqual(
        expect.stringMatching(new RegExp(expectedErrors.map(value => escapeStringRegexp(value ?? '')).join('|')))
      );
    } else {
      throw new Error(flattenDiagnosticMessageText(messageText, '\n'));
    }
  });
}

describe(FILENAME, () => {
  test('should succeed', () => compile(FILENAME));
  test('should have @ts-expect-error describing compile errors correctly', () => checkExpectError(FILENAME));
});
