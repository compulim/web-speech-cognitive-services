/// <reference types="node" />

import { expect } from 'expect';
import { afterEach, beforeEach, mock, test } from 'node:test';
import patchOptions from './patchOptions.ts';

beforeEach(() => {
  mock.method(console, 'error').mock.mockImplementation(() => {});
  mock.method(console, 'info').mock.mockImplementation(() => {});
  mock.method(console, 'log').mock.mockImplementation(() => {});
  mock.method(console, 'warn').mock.mockImplementation(() => {});
});

afterEach(() => {
  console.error.mock.restore();
  console.info.mock.restore();
  console.log.mock.restore();
  console.warn.mock.restore();
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
