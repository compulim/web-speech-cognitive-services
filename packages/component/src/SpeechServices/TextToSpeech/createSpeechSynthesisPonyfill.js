import memoize from 'memoize-one';
import onErrorResumeNext from 'on-error-resume-next';

import AudioContextQueue from './AudioContextQueue';
import DOMEventEmitter from '../../Util/DOMEventEmitter';
import fetchAuthorizationToken from '../fetchAuthorizationToken';
import fetchVoices from './fetchVoices';
import SpeechSynthesisUtterance from './SpeechSynthesisUtterance';

// Supported output format can be found at https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-text-to-speech#audio-outputs
const DEFAULT_OUTPUT_FORMAT = 'audio-24khz-160kbitrate-mono-mp3';

const TOKEN_EXPIRATION = 600000;
const TOKEN_EARLY_RENEWAL = 60000;

export default ({
  audioContext,
  authorizationToken,
  ponyfill = {
    AudioContext: window.AudioContext || window.webkitAudioContext
  },
  region = 'westus',
  speechSynthesisDeploymentId,
  speechSynthesisOutputFormat = DEFAULT_OUTPUT_FORMAT,
  subscriptionKey
}) => {
  if (!authorizationToken && !subscriptionKey) {
    console.warn('Either authorization token or subscription key must be specified');

    return {};
  } else if (!ponyfill.AudioContext) {
    console.warn('This browser does not support Web Audio and it will not work with Cognitive Services Speech Services.');

    return {};
  }

  const fetchMemoizedAuthorizationToken = memoize(
    ({ region, subscriptionKey }) => fetchAuthorizationToken({ region, subscriptionKey }),
    (arg, prevArg) => (
      arg.region === prevArg.region
      && arg.subscriptionKey === prevArg.subscriptionKey
      && arg.now - prevArg.now < TOKEN_EXPIRATION - TOKEN_EARLY_RENEWAL
    )
  );

  const getAuthorizationTokenPromise =
    typeof authorizationToken === 'function' ?
      authorizationToken()
    : authorizationToken ?
      authorizationToken
    :
      fetchMemoizedAuthorizationToken({
        now: Date.now,
        region,
        subscriptionKey
      });

  class SpeechSynthesis extends DOMEventEmitter {
    constructor() {
      super(['voiceschanged']);

      this.queue = new AudioContextQueue({ audioContext, ponyfill });
      this.voices = [];

      this.updateVoices();
    }

    cancel() {
      this.queue.stop();
    }

    getVoices() {
      return this.voices;
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
          authorizationTokenPromise: getAuthorizationTokenPromise,
          deploymentId: speechSynthesisDeploymentId,
          outputFormat: speechSynthesisOutputFormat,
          region
        });

        this.queue.push(utterance);
      });
    }

    get speaking() {
      return this.queue.speaking;
    }

    async updateVoices() {
      if (!speechSynthesisDeploymentId) {
        // Fetch voice list is not available for custom voice font.
        // If fetch voice list failed, we will not emit "voiceschanged" event.
        // In the spec, there is no "error" event.

        await onErrorResumeNext(async () => {
          this.voices = await fetchVoices({
            authorizationToken: await getAuthorizationTokenPromise,
            deploymentId: speechSynthesisDeploymentId,
            region
          });

          this.emit('voiceschanged');
        });
      }
    }
  }

  return {
    speechSynthesis: new SpeechSynthesis(),
    SpeechSynthesisUtterance
  };
}
