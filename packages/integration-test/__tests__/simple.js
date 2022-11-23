/*
 * @jest-environment jsdom
 */

const { default: createSpeechServicesPonyfill } = require('web-speech-cognitive-services');

test('package is installed', () => {
  expect(createSpeechServicesPonyfill).not.toBeUndefined();
  expect(typeof createSpeechServicesPonyfill).toBe('function');
});
