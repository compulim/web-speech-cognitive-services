/*
 * @jest-environment jsdom
 */

import { AudioStreamFormat } from 'microsoft-cognitiveservices-speech-sdk';
import createDeferred from 'p-defer-es5';

import { createSpeechRecognitionPonyfill } from '../src/SpeechServices';
import captureAllSpeechRecognitionEvents from '../utils/speechRecognition/captureAllSpeechRecognitionEvents';
import createQueuedArrayBufferAudioSource from '../utils/speechRecognition/createQueuedArrayBufferAudioSource';
import fetchSpeechData from '../src/SpeechServices/TextToSpeech/fetchSpeechData';
import testTableForAuthentication from '../utils/testTableForAuthentication';

const BITS_PER_SAMPLE = 16;
const CHANNELS = 1;
const OUTPUT_FORMAT = 'riff-8khz-16bit-mono-pcm';
const SAMPLES_PER_SECOND = 8000;

describe.each(testTableForAuthentication)('using %s', (_name, _useAuthorizationToken, _mergeCredentials, fetchCredentials) => {
  jest.setTimeout(15000);

  let audioConfig;

  beforeEach(async () => {
    audioConfig = createQueuedArrayBufferAudioSource(
      AudioStreamFormat.getWaveFormatPCM(SAMPLES_PER_SECOND, BITS_PER_SAMPLE, CHANNELS)
    );
  });

  test('to recognize', async () => {
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
              '0': {
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
});
