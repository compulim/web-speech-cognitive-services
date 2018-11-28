import AudioContextQueue from './AudioContextQueue';
import DOMEventEmitter from '../DOMEventEmitter';
import fetchAuthorizationToken from '../fetchAuthorizationToken';
import fetchVoices from './fetchVoices';
import memoize from 'memoize-one';
import SpeechSynthesisUtterance from './SpeechSynthesisUtterance';

// Supported output format can be found at https://docs.microsoft.com/en-us/azure/cognitive-services/Speech/API-Reference-REST/BingVoiceOutput#Subscription
const DEFAULT_OUTPUT_FORMAT = 'audio-16khz-128kbitrate-mono-mp3';

const TOKEN_EXPIRATION = 600000;
const TOKEN_EARLY_RENEWAL = 60000;

export default async ({
  authorizationToken,
  ponyfill = {
    AudioContext: window.AudioContext || window.webkitAudioContext
  },
  region = 'westus',
  subscriptionKey
}) => {
  // TODO: Provide either subscription key or authorization token
  if (!subscriptionKey) {
    console.warn('Subscription key must be specified');

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

    async speak(utterance) {
      if (!(utterance instanceof SpeechSynthesisUtterance)) {
        throw new Error('invalid utterance');
      }

      if (subscriptionKey) {
      }

      const authorizationToken = await fetchMemoizedAuthorizationToken({
        now: Date.now,
        region,
        subscriptionKey
      });

      return new Promise((resolve, reject) => {
        utterance.addEventListener('end', resolve);
        utterance.addEventListener('error', reject);
        utterance.authorizationToken = authorizationToken;
        utterance.region = region;
        utterance.outputFormat = this.outputFormat;
        utterance.preload();

        this.queue.push(utterance);
      });
    }
  }

  return {
    speechSynthesis: new SpeechSynthesis(),
    SpeechSynthesisUtterance
  };
}
