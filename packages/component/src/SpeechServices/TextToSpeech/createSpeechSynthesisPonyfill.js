/* eslint class-methods-use-this: 0 */

import { defineEventAttribute, EventTarget } from 'event-target-shim-es5';
import onErrorResumeNext from 'on-error-resume-next';

import AudioContextQueue from './AudioContextQueue';
import createFetchAuthorizationTokenWithCache from '../createFetchAuthorizationTokenWithCache';
import fetchCustomVoices from './fetchCustomVoices';
import fetchVoices from './fetchVoices';
import patchOptions from '../patchOptions';
import SpeechSynthesisEvent from './SpeechSynthesisEvent';
import SpeechSynthesisUtterance from './SpeechSynthesisUtterance';

// Supported output format can be found at https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-text-to-speech#audio-outputs
const DEFAULT_OUTPUT_FORMAT = 'audio-24khz-160kbitrate-mono-mp3';
const EMPTY_ARRAY = [];

export default options => {
  const {
    audioContext,
    fetchCredentials,
    ponyfill = {
      AudioContext: window.AudioContext || window.webkitAudioContext
    },
    region = 'westus',
    speechSynthesisDeploymentId,
    speechSynthesisOutputFormat = DEFAULT_OUTPUT_FORMAT,
    subscriptionKey
  } = patchOptions(options);

  if (!ponyfill.AudioContext) {
    console.warn(
      'web-speech-cognitive-services: This browser does not support Web Audio and it will not work with Cognitive Services Speech Services.'
    );

    return {};
  }

  const fetchAuthorizationTokenWithCache = createFetchAuthorizationTokenWithCache();

  const fetchAuthorizationTokenCredentials = async () => {
    const { authorizationToken, region, subscriptionKey } = await fetchCredentials();

    if (authorizationToken) {
      return { authorizationToken, region };
    }

    return {
      authorizationToken: await fetchAuthorizationTokenWithCache({ region, subscriptionKey }),
      region
    };
  };

  class SpeechSynthesis extends EventTarget {
    constructor() {
      super();

      this.queue = new AudioContextQueue({ audioContext, ponyfill });

      this.updateVoices();
    }

    cancel() {
      this.queue.stop();
    }

    getVoices() {
      return EMPTY_ARRAY;
    }

    pause() {
      this.queue.pause();
    }

    resume() {
      this.queue.resume();
    }

    speak(utterance) {
      if (!(utterance instanceof SpeechSynthesisUtterance)) {
        throw new Error('invalid utterance');
      }

      return new Promise((resolve, reject) => {
        utterance.addEventListener('end', resolve);
        utterance.addEventListener('error', reject);

        utterance.preload({
          deploymentId: speechSynthesisDeploymentId,
          fetchAuthorizationTokenCredentials,
          outputFormat: speechSynthesisOutputFormat
        });

        this.queue.push(utterance);
      });
    }

    get speaking() {
      return this.queue.speaking;
    }

    async updateVoices() {
      if (speechSynthesisDeploymentId) {
        if (subscriptionKey) {
          console.warn(
            'web-speech-cognitive-services: Listing of custom voice models are only available when using subscription key.'
          );

          await onErrorResumeNext(async () => {
            const voices = await fetchCustomVoices({
              deploymentId: speechSynthesisDeploymentId,
              region,
              subscriptionKey
            });

            this.getVoices = () => voices;
          });
        }
      } else {
        // If fetch voice list failed, we will not emit "voiceschanged" event.
        // In the spec, there is no "error" event.

        await onErrorResumeNext(async () => {
          const { authorizationToken, region } = await fetchAuthorizationTokenCredentials();
          const voices = await fetchVoices({ authorizationToken, region });

          this.getVoices = () => voices;
        });
      }

      this.dispatchEvent(new SpeechSynthesisEvent('voiceschanged'));
    }
  }

  defineEventAttribute(SpeechSynthesis.prototype, 'voiceschanged');

  return {
    speechSynthesis: new SpeechSynthesis(),
    SpeechSynthesisEvent,
    SpeechSynthesisUtterance
  };
};
