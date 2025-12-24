/* eslint class-methods-use-this: 0 */

import { EventTarget, getEventAttributeValue, setEventAttributeValue } from 'event-target-shim';
import { onErrorResumeNext } from 'on-error-resume-next/async';
import createDeferred from 'p-defer';

import patchOptions from '../patchOptions.ts';
import AudioContextQueue from './AudioContextQueue.js';
import SpeechSynthesisEvent from './SpeechSynthesisEvent.js';
import SpeechSynthesisUtterance from './SpeechSynthesisUtterance.js';
import fetchCustomVoices from './fetchCustomVoices.js';
import fetchVoices from './fetchVoices.js';

// Supported output format can be found at https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-text-to-speech#audio-outputs
const DEFAULT_OUTPUT_FORMAT = 'audio-24khz-160kbitrate-mono-mp3';
const EMPTY_ARRAY = [];

function createSpeechRecognitionPonyfill(options) {
  const {
    audioContext,
    fetchCredentials,
    ponyfill = {
      AudioContext: window.AudioContext || window.webkitAudioContext
    },
    speechSynthesisDeploymentId,
    speechSynthesisOutputFormat = DEFAULT_OUTPUT_FORMAT
  } = patchOptions(options);

  if (!audioContext && !ponyfill.AudioContext) {
    console.warn(
      'web-speech-cognitive-services: This browser does not support Web Audio and it will not work with Cognitive Services Speech Services.'
    );

    return {};
  }

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

    get onvoiceschanged() {
      return getEventAttributeValue(this, 'voiceschanged');
    }

    set onvoiceschanged(value) {
      setEventAttributeValue(this, 'voiceschanged', value);
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

      const { reject, resolve, promise } = createDeferred();
      const handleError = ({ error: errorCode, message }) => {
        const error = new Error(errorCode);

        error.stack = message;

        reject(error);
      };

      utterance.addEventListener('end', resolve);
      utterance.addEventListener('error', handleError);

      utterance.preload({
        deploymentId: speechSynthesisDeploymentId,
        fetchCredentials,
        outputFormat: speechSynthesisOutputFormat
      });

      this.queue.push(utterance);

      return promise.finally(() => {
        utterance.removeEventListener('end', resolve);
        utterance.removeEventListener('error', handleError);
      });
    }

    get speaking() {
      return this.queue.speaking;
    }

    async updateVoices() {
      const { customVoiceHostname, region, speechSynthesisHostname, subscriptionKey } = await fetchCredentials();

      if (speechSynthesisDeploymentId) {
        if (subscriptionKey) {
          console.warn(
            'web-speech-cognitive-services: Listing of custom voice models are only available when using subscription key.'
          );

          await onErrorResumeNext(async () => {
            const voices = await fetchCustomVoices({
              customVoiceHostname,
              deploymentId: speechSynthesisDeploymentId,
              region,
              speechSynthesisHostname,
              subscriptionKey
            });

            this.getVoices = () => voices;
          });
        }
      } else {
        // If fetch voice list failed, we will not emit "voiceschanged" event.
        // In the spec, there is no "error" event.

        await onErrorResumeNext(async () => {
          const voices = await fetchVoices(await fetchCredentials());

          this.getVoices = () => voices;
        });
      }

      this.dispatchEvent(new SpeechSynthesisEvent('voiceschanged'));
    }
  }

  return {
    speechSynthesis: new SpeechSynthesis(),
    SpeechSynthesisEvent,
    SpeechSynthesisUtterance
  };
}

export default createSpeechRecognitionPonyfill;
