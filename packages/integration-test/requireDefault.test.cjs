/*
 * @jest-environment jsdom
 */

const { createSpeechServicesPonyfill } = require('web-speech-cognitive-services');

test('should load', () => {
  expect(createSpeechServicesPonyfill).not.toBeUndefined();
  expect(typeof createSpeechServicesPonyfill).toBe('function');
});
