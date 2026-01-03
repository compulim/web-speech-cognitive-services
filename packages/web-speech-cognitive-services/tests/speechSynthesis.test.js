/// <reference types="node" />

import { describeEach } from '@compulim/test-harness/describeEach';
import { expect } from 'expect';
import { mock, test } from 'node:test';
import { createSpeechSynthesisPonyfill } from '../src/SpeechServices.ts';
import captureAllSpeechSynthesisUtteranceEvents from '../utils/speechSynthesis/captureAllSpeechSynthesisUtteranceEvents.js';
import MockAudioContext from '../utils/speechSynthesis/MockAudioContext.js';
import recognizeRiffWaveArrayBuffer from '../utils/speechSynthesis/recognizeRiffWaveArrayBuffer.js';
import testTableForAuthentication from '../utils/testTableForAuthentication.js';
import waitForEvent from '../utils/waitForEvent.js';

const { CI, REGION } = process.env;

describeEach(testTableForAuthentication)(
  'using %s',
  (_name, _useAuthorizationToken, _mergeCredentials, fetchCredentials) => {
    test('to synthesis', async () => {
      if (CI && !REGION) {
        return console.warn('Skipping tests against production system when running in CI without subscription key.');
      }

      const credentials = await fetchCredentials();
      const recognized = [];

      const bufferSourceStartHandler = mock.fn(async ({ target: { buffer } }) => {
        recognized.push(await recognizeRiffWaveArrayBuffer({ credentials, riffWaveArrayBuffer: buffer }));
      });

      const { speechSynthesis, SpeechSynthesisUtterance } = createSpeechSynthesisPonyfill({
        audioContext: new MockAudioContext({ bufferSourceStartHandler }),
        credentials,
        speechSynthesisOutputFormat: 'riff-8khz-16bit-mono-pcm'
      });

      await waitForEvent(speechSynthesis, 'voiceschanged');

      const voice = speechSynthesis.getVoices().find(voice => voice.lang === 'en-US' && /Aria/iu.test(voice.name));

      expect(voice.voiceURI).toEqual('Microsoft Server Speech Text to Speech Voice (en-US, AriaNeural)');

      const utterance = new SpeechSynthesisUtterance('Hello');

      utterance.voice = voice;

      const events = await captureAllSpeechSynthesisUtteranceEvents(utterance, () => speechSynthesis.speak(utterance));

      expect(bufferSourceStartHandler.mock.callCount()).toBe(1);

      expect(events).toEqual([
        'start',
        [
          'end',
          {
            elapsedTime: undefined
          }
        ]
      ]);

      () => expect(recognized).toEqual(['Hello.']);
    });
  }
);
