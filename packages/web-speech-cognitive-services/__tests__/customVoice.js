/*
 * @jest-environment jsdom
 */

import { createSpeechSynthesisPonyfill } from '../src/SpeechServices';
import captureAllSpeechSynthesisUtteranceEvents from '../utils/speechSynthesis/captureAllSpeechSynthesisUtteranceEvents';
// import fetchAuthorizationToken from '../utils/fetchAuthorizationToken';
import MockAudioContext from '../utils/speechSynthesis/MockAudioContext';
import recognizeRiffWaveArrayBuffer from '../utils/speechSynthesis/recognizeRiffWaveArrayBuffer';
import waitForEvent from '../utils/waitForEvent';
import testTableForAuthentication from '../utils/testTableForAuthentication';

const { CI, REGION } = process.env;

describe.each(testTableForAuthentication)(
  'Custom Voice: using %s',
  (_name, useAuthorizationToken, mergeCredentials, fetchCredentials) => {
    jest.setTimeout(15000);

    test('to synthesize', async () => {
      if (CI && !REGION) {
        return console.warn('Skipping tests against production system when running in CI without subscription key.');
      }

      const credentials = {
        ...(await fetchCredentials()),
        ...(mergeCredentials.region
          ? {}
          : {
              customVoiceHostname: 'westus2.customvoice.api.speech.microsoft.com',
              speechSynthesisHostname: 'westus2.voice.speech.microsoft.com'
            })
      };

      const recognized = [];

      const bufferSourceStartHandler = jest.fn(async ({ target: { buffer } }) => {
        recognized.push(await recognizeRiffWaveArrayBuffer({ credentials, riffWaveArrayBuffer: buffer }));
      });

      const { speechSynthesis, SpeechSynthesisUtterance } = createSpeechSynthesisPonyfill({
        audioContext: new MockAudioContext({ bufferSourceStartHandler }),
        credentials,
        speechSynthesisDeploymentId: process.env.SPEECH_SYNTHESIS_DEPLOYMENT_ID,
        speechSynthesisOutputFormat: 'riff-8khz-16bit-mono-pcm'
      });

      await waitForEvent(speechSynthesis, 'voiceschanged');

      const voices = speechSynthesis.getVoices();

      if (useAuthorizationToken) {
        // When using authorization token, it should not fetch voice list.
        expect(voices).toEqual([]);
        expect(global.fetch).toHaveBeenCalledTimes(0);
      } else {
        expect(voices.map(({ voiceURI }) => voiceURI)).toEqual([process.env.CUSTOM_VOICE_NAME]);
        expect(global.fetch).toHaveBeenCalledTimes(1);
      }

      const utterance = new SpeechSynthesisUtterance('Hello');

      // When using authorization token, voice list will not be fetched. We need to put in ourselves.
      utterance.voice = useAuthorizationToken ? { voiceURI: process.env.CUSTOM_VOICE_NAME } : voices[0];

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
  }
);
