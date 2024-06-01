/*
 * @jest-environment jsdom
 */

import { AudioStreamFormat } from 'microsoft-cognitiveservices-speech-sdk';
import { join } from 'path';
import { promisify } from 'util';
import createDeferred from 'p-defer';
import fs from 'fs';

import { createSpeechRecognitionPonyfill } from '../src/SpeechServices';
import captureAllSpeechRecognitionEvents from '../utils/speechRecognition/captureAllSpeechRecognitionEvents';
import createQueuedArrayBufferAudioSource from '../utils/speechRecognition/createQueuedArrayBufferAudioSource';
import testTableForAuthentication from '../utils/testTableForAuthentication';

const { CI, REGION } = process.env;
const BITS_PER_SAMPLE = 16;
const CHANNELS = 1;
const SAMPLES_PER_SECOND = 16000;

const readFile = promisify(fs.readFile);

describe.each(testTableForAuthentication)(
  'Custom Speech: using %s',
  (_name, _useAuthorizationToken, mergeCredentials, fetchCredentials) => {
    jest.setTimeout(15000);

    let audioConfig;
    let waveArrayBuffer;

    beforeAll(async () => {
      waveArrayBuffer = (await readFile(join(__dirname, 'tuen-mun-district-office.wav'))).buffer;
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
