/// <reference types="node" />

import { describeEach } from '@compulim/test-harness/describeEach';
import { expect } from 'expect';
import { AudioStreamFormat } from 'microsoft-cognitiveservices-speech-sdk';
import { beforeEach, test } from 'node:test';
import createDeferred from 'p-defer';
import { createSpeechRecognitionPonyfill } from '../src/SpeechServices.ts';
import fetchSpeechData from '../src/SpeechServices/TextToSpeech/fetchSpeechData.js';
import captureAllSpeechRecognitionEvents from '../utils/speechRecognition/captureAllSpeechRecognitionEvents.js';
import createQueuedArrayBufferAudioSource from '../utils/speechRecognition/createQueuedArrayBufferAudioSource.js';
import testTableForAuthentication from '../utils/testTableForAuthentication.js';

const { CI, REGION } = process.env;
const BITS_PER_SAMPLE = 16;
const CHANNELS = 1;
const OUTPUT_FORMAT = 'riff-8khz-16bit-mono-pcm';
const SAMPLES_PER_SECOND = 8000;

describeEach(testTableForAuthentication)(
  'using %s',
  (_name, _useAuthorizationToken, _mergeCredentials, fetchCredentials) => {
    let audioConfig;

    beforeEach(async () => {
      audioConfig = createQueuedArrayBufferAudioSource(
        AudioStreamFormat.getWaveFormatPCM(SAMPLES_PER_SECOND, BITS_PER_SAMPLE, CHANNELS)
      );
    });

    test('to recognize', async () => {
      if (CI && !REGION) {
        return console.warn('Skipping tests against production system when running in CI without subscription key.');
      }

      const credentials = await fetchCredentials();
      const { SpeechRecognition } = createSpeechRecognitionPonyfill({
        audioConfig,
        credentials
      });

      audioConfig.push(
        await fetchSpeechData({
          fetchCredentials: () => credentials,
          outputFormat: OUTPUT_FORMAT,
          text: 'Hello'
        })
      );

      const speechRecognition = new SpeechRecognition();
      const { promise, reject, resolve } = createDeferred();

      const events = await captureAllSpeechRecognitionEvents(speechRecognition, async () => {
        speechRecognition.addEventListener('end', resolve);
        speechRecognition.addEventListener('error', ({ error }) => reject(error));

        speechRecognition.start();

        await promise;
      });

      // `result` sometimes return confidence of 0.9 or 1.
      // It weirdly depends on whether subscription key or authorization token is being used.
      expect(events[7][0]).toEqual('result');

      if (events[7][1].results[0][0].confidence === 0.9) {
        events[7][1].results[0][0].confidence = 1;
      }

      expect(events).toEqual([
        'start',
        'audiostart',
        'soundstart',
        'speechstart',
        'speechend',
        'soundend',
        'audioend',
        [
          'result',
          {
            resultIndex: undefined,
            results: [
              {
                0: {
                  confidence: 1,
                  transcript: 'Hello.'
                },
                isFinal: true,
                length: 1
              }
            ]
          }
        ],
        'end'
      ]);
    });
  }
);
