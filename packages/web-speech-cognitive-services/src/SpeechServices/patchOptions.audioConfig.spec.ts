/// <reference types="jest" />

import { AudioConfig } from 'microsoft-cognitiveservices-speech-sdk';
import patchOptions, { type Credentials } from './patchOptions';

const credentials: Credentials = { authorizationToken: 'dummy', region: 'westus' };

describe('audioConfig of', () => {
  test('unspecified should patch to AudioConfig.fromMicrophoneInput', () =>
    expect(patchOptions({ credentials }).audioConfig).toBeTruthy());

  test('undefined should patch to AudioConfig.fromMicrophoneInput', () =>
    expect(patchOptions({ audioConfig: undefined, credentials }).audioConfig).toBeTruthy());

  test('type AudioConfig should kept as-is', () => {
    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();

    expect(patchOptions({ audioConfig, credentials }).audioConfig).toBe(audioConfig);
  });
});
