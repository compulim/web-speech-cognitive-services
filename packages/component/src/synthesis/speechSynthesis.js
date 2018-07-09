import AudioContextQueue from './AudioContextQueue';
import fetchVoices from './fetchVoices';
import SpeechSynthesisUtterance from './SpeechSynthesisUtterance';

// Supported output format can be found at https://docs.microsoft.com/en-us/azure/cognitive-services/Speech/API-Reference-REST/BingVoiceOutput#Subscription
const DEFAULT_OUTPUT_FORMAT = 'audio-16khz-128kbitrate-mono-mp3';

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

    if (!this.speechToken) {
      throw new Error('speechToken must be set');
    }

    if (!this.speechToken.value) {
      throw new Error('must wait for token to be authorized prior speak()');
    }

    return new Promise((resolve, reject) => {
      utterance.addEventListener('end', resolve);
      utterance.addEventListener('error', reject);
      utterance.outputFormat = this.outputFormat;
      utterance.speechToken = this.speechToken.value;
      utterance.preload();

      this.queue.push(utterance);
    });
  }
}

export default new SpeechSynthesis()
