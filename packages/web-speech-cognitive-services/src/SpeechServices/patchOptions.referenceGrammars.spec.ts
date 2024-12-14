/// <reference types="jest" />

import patchOptions, { type Credentials } from './patchOptions';

const credentials: Credentials = { authorizationToken: 'dummy', region: 'westus' };

describe('referenceGrammars of', () => {
  test('unspecified should patch to empty readonly array', () => {
    const { referenceGrammars } = patchOptions({ credentials });

    expect(referenceGrammars).toEqual([]);
    expect(Object.isFrozen(referenceGrammars)).toBe(true);
  });

  test('undefined should kept as-is', () => {
    const { referenceGrammars } = patchOptions({ credentials, referenceGrammars: undefined });

    expect(referenceGrammars).toEqual([]);
    expect(Object.isFrozen(referenceGrammars)).toBe(true);
  });

  test('an array should be frozen', () => {
    const input: string[] = [];
    const { referenceGrammars } = patchOptions({ credentials, referenceGrammars: input });

    expect(referenceGrammars).toEqual([]);
    expect(Object.isFrozen(referenceGrammars)).toBe(true);
    expect(referenceGrammars).not.toBe(input); // Should not freeze passing array.
  });

  test('an frozen array should kept as-is', () => {
    const input: readonly string[] = Object.freeze([]);
    const { referenceGrammars } = patchOptions({ credentials, referenceGrammars: input });

    expect(Object.isFrozen(referenceGrammars)).toBe(true);

    // valibot.array() always create a new instance because of technical limitations.
    // Say, child item need to be transformed, will need to be put inside a new array.
    expect(referenceGrammars).not.toBe(input);
  });

  test('an array of type number should throw', () => {
    // @ts-expect-error For testing purpose.
    expect(() => patchOptions({ credentials, referenceGrammars: [1] })).toThrow();
  });

  test('a frozen array of type number should throw', () => {
    // @ts-expect-error For testing purpose.
    expect(() => patchOptions({ credentials, referenceGrammars: Object.freeze([1]) })).toThrow();
  });
});
