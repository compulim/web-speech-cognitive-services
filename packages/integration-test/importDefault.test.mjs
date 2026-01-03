import { test } from 'node:test';
import { expect } from 'expect';
import { createSpeechServicesPonyfill } from 'web-speech-cognitive-services';

test('should load', () => {
  expect(createSpeechServicesPonyfill).not.toBeUndefined();
  expect(typeof createSpeechServicesPonyfill).toBe('function');
});
