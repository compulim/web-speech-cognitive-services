import AudioContextQueue from './AudioContextQueue';
import fetchVoices from './fetchVoices';
import SpeechSynthesisUtterance from './SpeechSynthesisUtterance';

const DEFAULT_REGION = 'westus';
// Supported output format can be found at https://docs.microsoft.com/en-us/azure/cognitive-services/Speech/API-Reference-REST/BingVoiceOutput#Subscription
const DEFAULT_OUTPUT_FORMAT = 'audio-16khz-128kbitrate-mono-mp3';

class SpeechSynthesis {
  constructor() {
    this.onvoiceschanged = null;
    this.region = DEFAULT_REGION;
    this.outputFormat = DEFAULT_OUTPUT_FORMAT;
    this.queue = new AudioContextQueue();
    this._isAboutToSpeak = false;
  }

  cancel() {
    this._isAboutToSpeak = false;

    this.queue.stop();
  }

  getVoices() {
    return fetchVoices();
  }

  async speak(utterance) {
    if (!(utterance instanceof SpeechSynthesisUtterance)) {
      throw new Error('invalid utterance');
    }

    if (!this.fetchToken) {
      throw new Error('SpeechSynthesis: fetchToken must be set');
    } else if (typeof this.fetchToken !== 'function') {
      throw new Error('SpeechSynthesis: fetchToken must be a function that returns a Promise and it will resolve to a string-based token');
    }

    this._isAboutToSpeak = true;

    const accessToken = await this.fetchToken();

    return new Promise((resolve, reject) => {
      if (this._isAboutToSpeak) {
        utterance.addEventListener('end', resolve);
        utterance.addEventListener('error', reject);
        utterance.accessToken = accessToken;
        utterance.region = this.region;
        utterance.outputFormat = this.outputFormat;
        utterance.preload();
      }

      if (this._isAboutToSpeak) {
        this._isAboutToSpeak = false;

        this.queue.push(utterance);
      }
    });
  }
}

export default new SpeechSynthesis()
