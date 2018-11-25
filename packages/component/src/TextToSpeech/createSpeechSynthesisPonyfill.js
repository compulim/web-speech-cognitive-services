import AudioContextQueue from './AudioContextQueue';
import fetchAccessToken from '../fetchAccessToken';
import fetchVoices from './fetchVoices';
import memoize from 'memoize-one';
import SpeechSynthesisUtterance from './SpeechSynthesisUtterance';

// Supported output format can be found at https://docs.microsoft.com/en-us/azure/cognitive-services/Speech/API-Reference-REST/BingVoiceOutput#Subscription
const DEFAULT_OUTPUT_FORMAT = 'audio-16khz-128kbitrate-mono-mp3';

const TOKEN_EXPIRATION = 600000;
const TOKEN_EARLY_RENEWAL = 60000;

export default async ({
  region = 'westus',
  subscriptionKey
}) => {
  if (
    !subscriptionKey
    || (!window.AudioContext && !window.webkitAudioContext)
  ) {
    return {};
  }

  const fetchMemoizedAccessToken = memoize(
    ({ subscriptionKey }) => fetchAccessToken(subscriptionKey),
    (arg, prevArg) => (
      arg.subscriptionKey === prevArg.subscriptionKey
      && arg.now - prevArg.now < TOKEN_EXPIRATION - TOKEN_EARLY_RENEWAL
    )
  );

  class SpeechSynthesis {
    constructor() {
      this.onvoiceschanged = null;
      this.outputFormat = DEFAULT_OUTPUT_FORMAT;
      this.queue = new AudioContextQueue();
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

      const accessToken = await fetchMemoizedAccessToken({
        now: Date.now,
        subscriptionKey
      });

      return new Promise((resolve, reject) => {
        utterance.addEventListener('end', resolve);
        utterance.addEventListener('error', reject);
        utterance.accessToken = accessToken;
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
