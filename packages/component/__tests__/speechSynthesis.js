/*
 * @jest-environment jsdom
 */

import { createSpeechSynthesisPonyfill } from '../src/SpeechServices';
import captureAllSpeechSynthesisUtteranceEvents from '../utils/speechSynthesis/captureAllSpeechSynthesisUtteranceEvents';
import MockAudioContext from '../utils/speechSynthesis/MockAudioContext';
import recognizeRiffWaveArrayBuffer from '../utils/speechSynthesis/recognizeRiffWaveArrayBuffer';
import testTableForAuthentication from '../utils/testTableForAuthentication';
import waitForEvent from '../utils/waitForEvent';

describe.each(testTableForAuthentication)('using %s', (_name, _useAuthorizationToken, _mergeCredentials, fetchCredentials) => {
  jest.setTimeout(10000);

  test('to synthesis', async () => {
    const credentials = await fetchCredentials();
    const recognized = [];

    const bufferSourceStartHandler = jest.fn(async ({ target: { buffer } }) => {
      recognized.push(await recognizeRiffWaveArrayBuffer({ credentials, riffWaveArrayBuffer: buffer }));
    });

    const { speechSynthesis, SpeechSynthesisUtterance } = createSpeechSynthesisPonyfill({
      audioContext: new MockAudioContext({ bufferSourceStartHandler }),
      credentials,
      speechSynthesisOutputFormat: 'riff-8khz-16bit-mono-pcm'
    });

    await waitForEvent(speechSynthesis, 'voiceschanged');

    const voice = speechSynthesis.getVoices().find(voice => voice.lang === 'en-US' && /Jessa/iu.test(voice.name));

    expect(voice.voiceURI).toEqual('Microsoft Server Speech Text to Speech Voice (en-US, Jessa24kRUS)');

    const utterance = new SpeechSynthesisUtterance('Hello');

    utterance.voice = voice;

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
