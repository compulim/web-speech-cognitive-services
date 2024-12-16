/// <reference types="jest" />

import patchOptions, { type Credentials } from './patchOptions';

const credentials: Credentials = { authorizationToken: 'dummy', region: 'westus' };

describe('enableTelemetry of', () => {
  test('unspecified should patch to undefined', () =>
    expect(patchOptions({ credentials })).toEqual(expect.objectContaining({ enableTelemetry: undefined })));

  test('undefined should kept as-is', () =>
    expect(patchOptions({ credentials, enableTelemetry: undefined })).toEqual(
      expect.objectContaining({ enableTelemetry: undefined })
    ));

  test('false should kept as-is', () =>
    expect(patchOptions({ credentials, enableTelemetry: false })).toEqual(
      expect.objectContaining({ enableTelemetry: false })
    ));

  test('true should kept as-is', () =>
    expect(patchOptions({ credentials, enableTelemetry: true })).toEqual(
      expect.objectContaining({ enableTelemetry: true })
    ));
});
