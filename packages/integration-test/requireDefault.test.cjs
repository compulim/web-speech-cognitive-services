const { expect } = require('expect');
const { test } = require('node:test');
const { createSpeechServicesPonyfill } = require('web-speech-cognitive-services');

test('should load', () => {
  expect(createSpeechServicesPonyfill).not.toBeUndefined();
  expect(typeof createSpeechServicesPonyfill).toBe('function');
});
