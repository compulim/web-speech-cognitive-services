/// <reference types="jest" />

import patchOptions, { type Credentials } from './patchOptions';

const credentials: Credentials = { authorizationToken: 'dummy', region: 'westus' };

describe('looseEvents of', () => {
  test('unspecified should patch to false', () =>
    expect(patchOptions({ credentials })).toEqual(expect.objectContaining({ looseEvents: false })));

  test('undefined should patch to false', () =>
    expect(patchOptions({ credentials, looseEvents: undefined })).toEqual(
      expect.objectContaining({ looseEvents: false })
    ));

  test('false should kept as-is', () =>
    expect(patchOptions({ credentials, looseEvents: false })).toEqual(expect.objectContaining({ looseEvents: false })));

  test('true should kept as-is', () =>
    expect(patchOptions({ credentials, looseEvents: true })).toEqual(expect.objectContaining({ looseEvents: true })));
});
