/// <reference types="jest" />

import patchOptions, { type Credentials } from './patchOptions';

const credentials: Credentials = { authorizationToken: 'dummy', region: 'westus' };

describe('textNormalization of', () => {
  test('unspecified should patch to "display"', () =>
    expect(patchOptions({ credentials })).toEqual(expect.objectContaining({ textNormalization: 'display' })));

  test('undefined should patch to "display"', () =>
    expect(patchOptions({ credentials, textNormalization: undefined })).toEqual(
      expect.objectContaining({ textNormalization: 'display' })
    ));

  test('"display" should kept as-is', () =>
    expect(patchOptions({ credentials, textNormalization: 'display' })).toEqual(
      expect.objectContaining({ textNormalization: 'display' })
    ));

  test('"itn" should kept as-is', () =>
    expect(patchOptions({ credentials, textNormalization: 'itn' })).toEqual(
      expect.objectContaining({ textNormalization: 'itn' })
    ));

  test('"lexical" should kept as-is', () =>
    expect(patchOptions({ credentials, textNormalization: 'lexical' })).toEqual(
      expect.objectContaining({ textNormalization: 'lexical' })
    ));

  test('"maskeditn" should kept as-is', () =>
    expect(patchOptions({ credentials, textNormalization: 'maskeditn' })).toEqual(
      expect.objectContaining({ textNormalization: 'maskeditn' })
    ));

  test('"xyz" should throw', () =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => patchOptions({ credentials, textNormalization: 'xyz' as any })).toThrow());
});
