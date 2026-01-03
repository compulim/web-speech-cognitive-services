/// <reference types="node" />

import { describeEach } from '@compulim/test-harness/describeEach';
import { expect } from 'expect';
import fs from 'fs';
import { AudioStreamFormat } from 'microsoft-cognitiveservices-speech-sdk';
import { before, beforeEach, test } from 'node:test';
import createDeferred from 'p-defer';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { createSpeechRecognitionPonyfill } from '../src/SpeechServices.ts';
import captureAllSpeechRecognitionEvents from '../utils/speechRecognition/captureAllSpeechRecognitionEvents.js';
import createQueuedArrayBufferAudioSource from '../utils/speechRecognition/createQueuedArrayBufferAudioSource.js';
import testTableForAuthentication from '../utils/testTableForAuthentication.js';

const { CI, REGION } = process.env;
const BITS_PER_SAMPLE = 16;
const CHANNELS = 1;
const SAMPLES_PER_SECOND = 16000;

const readFile = promisify(fs.readFile);

describeEach(testTableForAuthentication)(
  'Custom Speech: using %s',
  (_name, _useAuthorizationToken, mergeCredentials, fetchCredentials) => {
    let audioConfig;
    let waveArrayBuffer;

    before(async () => {
      waveArrayBuffer = (await readFile(resolve(fileURLToPath(import.meta.url), '../tuen-mun-district-office.wav')))
        .buffer;
    });

    beforeEach(async () => {
      audioConfig = createQueuedArrayBufferAudioSource(
        AudioStreamFormat.getWaveFormatPCM(SAMPLES_PER_SECOND, BITS_PER_SAMPLE, CHANNELS)
      );
    });

    test('to recognize', async () => {
      if (CI && !REGION) {
        return console.warn('Skipping tests against production system when running in CI without subscription key.');
      }

      const credentials = {
        ...(await fetchCredentials()),
        ...(!mergeCredentials.region && {
          speechRecognitionHostname: 'westus2.stt.speech.microsoft.com'
        })
      };

      const { SpeechRecognition } = createSpeechRecognitionPonyfill({
        audioConfig,
        credentials,
        speechRecognitionEndpointId: process.env.SPEECH_RECOGNITION_ENDPOINT_ID
      });

      // We cannot use "fetchSpeechData" because the quality of the synthesis using Custom Voice is too low to being recognized by itself.
      audioConfig.push(waveArrayBuffer);

      const speechRecognition = new SpeechRecognition();
      const { promise, reject, resolve } = createDeferred();

      const events = await captureAllSpeechRecognitionEvents(speechRecognition, async () => {
        speechRecognition.addEventListener('end', resolve);
        speechRecognition.addEventListener('error', ({ error }) => reject(error));

        speechRecognition.start();

        await promise;
      });

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
                  confidence: 0.9,
                  transcript: 'Tuen Mun district office.'
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
