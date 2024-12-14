/// <reference types="jest" />

import patchOptions, { type Credentials } from './patchOptions';

const credentials: Credentials = { authorizationToken: 'dummy', region: 'westus' };

describe('speechRecognitionEndpointId of', () => {
  test('unspecified should patch to undefined', () =>
    expect(patchOptions({ credentials })).toEqual(expect.objectContaining({ speechRecognitionEndpointId: undefined })));

  test('undefined should kept as-is', () =>
    expect(patchOptions({ credentials, speechRecognitionEndpointId: undefined })).toEqual(
      expect.objectContaining({ speechRecognitionEndpointId: undefined })
    ));

  test('string value should kept as-is', () =>
    expect(patchOptions({ credentials, speechRecognitionEndpointId: 'Hello, World!' })).toEqual(
      expect.objectContaining({ speechRecognitionEndpointId: 'Hello, World!' })
    ));
});
