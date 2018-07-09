import AudioContextQueue from './AudioContextQueue';
import exchangeToken from './exchangeToken';
import fetchVoices from './fetchVoices';
import SpeechSynthesisUtterance from './SpeechSynthesisUtterance';

// Supported output format can be found at https://docs.microsoft.com/en-us/azure/cognitive-services/Speech/API-Reference-REST/BingVoiceOutput#Subscription
const DEFAULT_OUTPUT_FORMAT = 'audio-16khz-128kbitrate-mono-mp3';

// Token expiration is hardcoded at 10 minutes
// https://docs.microsoft.com/en-us/azure/cognitive-services/Speech/how-to/how-to-authentication?tabs=Powershell#use-an-authorization-token
const TOKEN_EXPIRATION = 600000;
const TOKEN_EARLY_RENEWAL = 60000;

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

  async authorize(subscriptionKey, autoRenewal = true) {
    clearTimeout(this._renewal);

    this.speechToken = subscriptionKey && await exchangeToken(subscriptionKey);

    this._renewal = autoRenewal && setTimeout(() => {
      this.fetchToken(subscriptionKey);
    }, TOKEN_EXPIRATION - TOKEN_EARLY_RENEWAL);
  }

  async speak(utterance) {
    if (!(utterance instanceof SpeechSynthesisUtterance)) {
      throw new Error('invalid utterance');
    }

    if (!this.speechToken) {
      throw new Error('authorize() must be called prior speak()');
    }

    return new Promise((resolve, reject) => {
      utterance.addEventListener('end', resolve);
      utterance.addEventListener('error', reject);
      utterance.outputFormat = this.outputFormat;
      utterance.speechToken = this.speechToken;
      utterance.preload();

      this.queue.push(utterance);
    });
  }
}

export default new SpeechSynthesis()
