/*
 * @jest-environment jsdom
 */

import { createSpeechServicesPonyfill } from 'web-speech-cognitive-services';

test('should load', () => {
  expect(createSpeechServicesPonyfill).not.toBeUndefined();
  expect(typeof createSpeechServicesPonyfill).toBe('function');
});
