import patchOptions from './patchOptions';

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation();
  jest.spyOn(console, 'info').mockImplementation();
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'warn').mockImplementation();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('should throw exception when region and speechSynthesisHostname are not specified', async () => {
  await expect(
    // @ts-expect-error
    patchOptions({ credentials: { authorizationToken: 'AUTHORIZATION_TOKEN' } }).fetchCredentials()
  ).rejects.toThrow();
});

test('should throw exception both region and customVoiceHostname are specified', async () => {
  await expect(
    patchOptions({
      // @ts-expect-error
      credentials: {
        authorizationToken: 'AUTHORIZATION_TOKEN',
        customVoiceHostname: 'westus2.cris.ai'
      }
    }).fetchCredentials()
  ).rejects.toThrow();
});

test('should throw exception both region and speechSynthesisHostname are specified', async () => {
  await expect(
    patchOptions({
      // @ts-expect-error
      credentials: {
        authorizationToken: 'AUTHORIZATION_TOKEN',
        speechSynthesisHostname: 'westus2.tts.speech.microsoft.com'
      }
    }).fetchCredentials()
  ).rejects.toThrow();
});

test('should throw exception both region and speechRecognitionHostname are specified', async () => {
  await expect(
    patchOptions({
      // @ts-expect-error
      credentials: {
        authorizationToken: 'AUTHORIZATION_TOKEN',
        speechSynthesisHostname: 'westus2.stt.speech.microsoft.com'
      }
    }).fetchCredentials()
  ).rejects.toThrow();
});

test('should throw exception if only speechRecognitionHostname are specified', async () => {
  await expect(
    patchOptions({
      // @ts-expect-error
      credentials: {
        speechRecognitionHostname: 'westus2.stt.speech.microsoft.com'
      }
    }).fetchCredentials()
  ).rejects.toThrow();
});

test('using custom hostname without Custom Voice', async () => {
  await expect(
    patchOptions({
      credentials: {
        authorizationToken: 'AUTHORIZATION_TOKEN',
        speechRecognitionHostname: 'westus2.stt.speech.microsoft.com',
        speechSynthesisHostname: 'westus2.stt.speech.microsoft.com'
      }
    }).fetchCredentials()
  ).resolves.toEqual({
    authorizationToken: 'AUTHORIZATION_TOKEN',
    speechRecognitionHostname: 'westus2.stt.speech.microsoft.com',
    speechSynthesisHostname: 'westus2.stt.speech.microsoft.com'
  });
});

test('using custom hostname with Custom Voice', async () => {
  await expect(
    patchOptions({
      credentials: {
        authorizationToken: 'AUTHORIZATION_TOKEN',
        customVoiceHostname: 'westus2.cris.ai',
        speechRecognitionHostname: 'westus2.stt.speech.microsoft.com',
        speechSynthesisHostname: 'westus2.stt.speech.microsoft.com'
      }
    }).fetchCredentials()
  ).resolves.toEqual({
    authorizationToken: 'AUTHORIZATION_TOKEN',
    customVoiceHostname: 'westus2.cris.ai',
    speechRecognitionHostname: 'westus2.stt.speech.microsoft.com',
    speechSynthesisHostname: 'westus2.stt.speech.microsoft.com'
  });
});
