/// <reference types="jest" />

import patchOptions, { type Credentials } from './patchOptions';

const credentials: Credentials = { authorizationToken: 'dummy', region: 'westus' };

describe('initialSilenceTimeout of', () => {
  test('unspecified should patch to undefined', () =>
    expect(patchOptions({ credentials })).toEqual(expect.objectContaining({ initialSilenceTimeout: undefined })));

  test('undefined should kept as-is', () =>
    expect(patchOptions({ credentials, initialSilenceTimeout: undefined })).toEqual(
      expect.objectContaining({ initialSilenceTimeout: undefined })
    ));

  test('zero should throw', () => expect(() => patchOptions({ credentials, initialSilenceTimeout: 0 })).toThrow());

  test('one should kept as-is', () =>
    expect(patchOptions({ credentials, initialSilenceTimeout: 1 })).toEqual(
      expect.objectContaining({ initialSilenceTimeout: 1 })
    ));
});
