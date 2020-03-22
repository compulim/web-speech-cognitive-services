/*
 * @jest-environment jsdom
 */

import { createSpeechSynthesisPonyfill } from '../src/SpeechServices';
import captureAllSpeechSynthesisUtteranceEvents from '../utils/speechSynthesis/captureAllSpeechSynthesisUtteranceEvents';
import MockAudioContext from '../utils/speechSynthesis/MockAudioContext';
import recognizeRiffWaveArrayBuffer from '../utils/speechSynthesis/recognizeRiffWaveArrayBuffer';
import waitForEvent from '../utils/waitForEvent';

describe.each([
  ['region', { region: 'westus2' }],
  [
    'host',
    {
      customVoiceHostname: 'westus2.cris.ai',
      speechRecognitionHostname: 'westus2.stt.speech.microsoft.com',
      speechSynthesisHostname: 'westus2.voice.speech.microsoft.com'
    }
  ]
])('Custom Voice: using %s', (_, mergeCredentials) => {
  test('to synthesize', async () => {
    const credentials = {
      ...mergeCredentials,
      subscriptionKey: process.env.SUBSCRIPTION_KEY
    };

    const recognized = [];

    const bufferSourceStartHandler = jest.fn(async ({ target: { buffer } }) => {
      recognized.push(await recognizeRiffWaveArrayBuffer({ credentials, riffWaveArrayBuffer: buffer }));
    });

    const { speechSynthesis, SpeechSynthesisUtterance } = createSpeechSynthesisPonyfill({
      audioContext: new MockAudioContext({ bufferSourceStartHandler }),
      credentials,
      speechSynthesisDeploymentId: '50e5430a-cc1a-4c33-9afb-f0a4470fc921',
      speechSynthesisOutputFormat: 'riff-8khz-16bit-mono-pcm'
    });

    await waitForEvent(speechSynthesis, 'voiceschanged');

    const voices = speechSynthesis.getVoices();

    expect(voices.map(({ voiceURI }) => voiceURI)).toEqual(['William']);

    const utterance = new SpeechSynthesisUtterance('Hello');

    utterance.voice = voices[0];

    const events = await captureAllSpeechSynthesisUtteranceEvents(utterance, () => speechSynthesis.speak(utterance));

    expect(bufferSourceStartHandler).toHaveBeenCalledTimes(1);

    expect(events).toEqual([
      'start',
      [
        'end',
        {
          elapsedTime: undefined
        }
      ]
    ]);

    expect(recognized).toEqual(['Hello.']);
  });
});
