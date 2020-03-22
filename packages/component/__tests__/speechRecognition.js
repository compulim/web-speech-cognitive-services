/*
 * @jest-environment jsdom
 */

import createDeferred from 'p-defer';

import { createSpeechRecognitionPonyfill } from '../src/SpeechServices';
import captureAllSpeechRecognitionEvents from '../utils/captureAllSpeechRecognitionEvents';
import createQueuedArrayBufferAudioSource from '../utils/createQueuedArrayBufferAudioSource';
import fetchAuthorizationToken from '../utils/fetchAuthorizationToken';
import fetchSpeechData from '../src/SpeechServices/TextToSpeech/fetchSpeechData';

let audioConfig;

beforeEach(async () => {
  audioConfig = createQueuedArrayBufferAudioSource();
});

test.each([
  ['authorization token and region', true, { region: process.env.REGION }],
  [
    'authorization token and host',
    true,
    {
      speechRecognitionHostname: 'westus2.stt.speech.microsoft.com',
      speechSynthesisHostname: 'westus2.tts.speech.microsoft.com',
      tokenURL: 'https://westus2.api.cognitive.microsoft.com/sts/v1.0/issueToken'
    }
  ],
  ['subscription key and region', false, { region: process.env.REGION }],
  [
    'subscription key and host',
    false,
    {
      speechRecognitionHostname: 'westus2.stt.speech.microsoft.com',
      speechSynthesisHostname: 'westus2.tts.speech.microsoft.com',
      tokenURL: 'https://westus2.api.cognitive.microsoft.com/sts/v1.0/issueToken'
    }
  ]
])('recognize "Hello" using %s', async (_, useAuthorizationToken, mergeCredentials) => {
  const credentials = { ...mergeCredentials };

  if (useAuthorizationToken) {
    credentials.authorizationToken = await fetchAuthorizationToken({
      subscriptionKey: process.env.SUBSCRIPTION_KEY,
      ...mergeCredentials
    });
  } else {
    credentials.subscriptionKey = process.env.SUBSCRIPTION_KEY;
  }

  const { SpeechRecognition } = createSpeechRecognitionPonyfill({
    audioConfig,
    credentials
  });

  audioConfig.push(await fetchSpeechData({ fetchCredentials: () => credentials, text: 'Hello' }));

  const speechRecognition = new SpeechRecognition();
  const { promise, reject, resolve } = createDeferred();

  const { getEvents } = captureAllSpeechRecognitionEvents(speechRecognition);

  speechRecognition.addEventListener('end', resolve);
  speechRecognition.addEventListener('error', ({ error }) => reject(error));

  speechRecognition.start();

  await promise;

  expect(getEvents()).toMatchInlineSnapshot(`
    Array [
      "start",
      "audiostart",
      "soundstart",
      "speechstart",
      "speechend",
      "soundend",
      "audioend",
      Array [
        "result",
        Object {
          "resultIndex": undefined,
          "results": Array [
            Object {
              "0": Object {
                "confidence": 0.95,
                "transcript": "Hello.",
              },
              "isFinal": true,
              "length": 1,
            },
          ],
        },
      ],
      "end",
    ]
  `);

  // console.log(JSON.stringify(getEvents(), null, 2));
});
