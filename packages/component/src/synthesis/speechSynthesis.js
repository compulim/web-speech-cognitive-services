import AudioContextQueue from './AudioContextQueue';
import fetchSpeechToken from './fetchSpeechToken';
import fetchVoices from './fetchVoices';

// Token expiration is hardcoded at 10 minutes
// https://docs.microsoft.com/en-us/azure/cognitive-services/Speech/how-to/how-to-authentication?tabs=Powershell#use-an-authorization-token
const TOKEN_EXPIRATION = 600000;
const TOKEN_EARLY_RENEWAL = 60000;

class CognitiveServicesSpeechSynthesis {
  constructor() {
    this.onvoiceschanged = null;
    this.queue = new AudioContextQueue();
    this.subscriptionKey = localStorage.getItem('SPEECH_KEY');
  }

  cancel() {
    this.queue.stop();
  }

  getVoices() {
    return fetchVoices();
  }

  async fetchToken() {
    if (!this.tokenPromise) {
      this.tokenPromise = fetchSpeechToken(this.subscriptionKey).then(token => {
        setTimeout(() => {
          this.tokenPromise = null;
        }, TOKEN_EXPIRATION - TOKEN_EARLY_RENEWAL);

        return token;
      }, err => {
        this.tokenPromise = null;

        return Promise.rejects(err);
      });
    }

    return await this.tokenPromise;
  }

  async speak(utterance) {
    utterance.speechToken = await this.fetchToken();
    utterance.preload();

    this.queue.push(utterance);
  }
}

export default new CognitiveServicesSpeechSynthesis()
