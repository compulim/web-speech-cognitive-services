import memoize from 'memoize-one';

import AudioContextQueue from './AudioContextQueue';
import DOMEventEmitter from '../../Util/DOMEventEmitter';
import fetchAuthorizationToken from '../fetchAuthorizationToken';
import fetchVoices from './fetchVoices';
import SpeechSynthesisUtterance from './SpeechSynthesisUtterance';

// Supported output format can be found at https://docs.microsoft.com/en-us/azure/cognitive-services/Speech/API-Reference-REST/BingVoiceOutput#Subscription
const DEFAULT_OUTPUT_FORMAT = 'audio-16khz-128kbitrate-mono-mp3';

const TOKEN_EXPIRATION = 600000;
const TOKEN_EARLY_RENEWAL = 60000;

export default ({
  audioContext,
  authorizationToken,
  ponyfill = {
    AudioContext: window.AudioContext || window.webkitAudioContext
  },
  region = 'westus',
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

      this.outputFormat = DEFAULT_OUTPUT_FORMAT;
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

      return new Promise(async (resolve, reject) => {
        utterance.addEventListener('end', resolve);
        utterance.addEventListener('error', reject);

        utterance.authorizationToken = await getAuthorizationTokenPromise;
        utterance.region = region;
        utterance.outputFormat = this.outputFormat;
        utterance.preload();

        this.queue.push(utterance);
      });
    }

    get speaking() {
      return this.queue.speaking;
    }

    async updateVoices() {
      this.voices = await fetchVoices({ authorizationToken: await getAuthorizationTokenPromise, region });

      this.emit('voiceschanged');
    }
  }

  return {
    speechSynthesis: new SpeechSynthesis(),
    SpeechSynthesisUtterance
  };
}
