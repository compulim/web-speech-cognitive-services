import memoize from 'memoize-one';

import AudioContextQueue from './AudioContextQueue';
import DOMEventEmitter from '../Util/DOMEventEmitter';
import fetchAuthorizationToken from '../fetchAuthorizationToken';
import fetchVoices from './fetchVoices';
import SpeechSynthesisUtterance from './SpeechSynthesisUtterance';

// Supported output format can be found at https://docs.microsoft.com/en-us/azure/cognitive-services/Speech/API-Reference-REST/BingVoiceOutput#Subscription
const DEFAULT_OUTPUT_FORMAT = 'audio-16khz-128kbitrate-mono-mp3';

const TOKEN_EXPIRATION = 600000;
const TOKEN_EARLY_RENEWAL = 60000;

export default ({
  authorizationToken,
  ponyfill = {
    AudioContext: window.AudioContext || window.webkitAudioContext
  },
  subscriptionKey
}) => {
  if (!authorizationToken && !subscriptionKey) {
    console.warn('Either authorizationToken or subscriptionKey must be specified');

    return {};
  } else if (!ponyfill.AudioContext) {
    console.warn('This browser does not support Web Audio and it will not work with Cognitive Services Speech Services.');

    return {};
  }

  const fetchMemoizedAuthorizationToken = memoize(
    ({ subscriptionKey }) => fetchAuthorizationToken(subscriptionKey),
    (arg, prevArg) => (
      arg.subscriptionKey === prevArg.subscriptionKey
      && arg.now - prevArg.now < TOKEN_EXPIRATION - TOKEN_EARLY_RENEWAL
    )
  );

  class SpeechSynthesis extends DOMEventEmitter {
    constructor() {
      super(['voiceschanged']);

      this.outputFormat = DEFAULT_OUTPUT_FORMAT;
      this.queue = new AudioContextQueue(ponyfill);
    }

    cancel() {
      this.queue.stop();
    }

    getVoices() {
      return fetchVoices();
    }

    pause() {
      this.queue.pause();
    }

    resume() {
      this.queue.resume();
    }

    async speak(utterance) {
      if (!(utterance instanceof SpeechSynthesisUtterance)) {
        throw new Error('invalid utterance');
      }

      return new Promise(async (resolve, reject) => {
        utterance.addEventListener('end', resolve);
        utterance.addEventListener('error', reject);

        utterance.authorizationToken =
          typeof authorizationToken === 'function' ?
            await authorizationToken()
          : authorizationToken ?
            await authorizationToken
          : await fetchMemoizedAuthorizationToken({
            now: Date.now,
            subscriptionKey
          });
        utterance.outputFormat = this.outputFormat;
        utterance.preload();

        this.queue.push(utterance);
      });
    }

    get speaking() {
      return this.queue.speaking;
    }
  }

  return {
    speechSynthesis: new SpeechSynthesis(),
    SpeechSynthesisUtterance
  };
}
