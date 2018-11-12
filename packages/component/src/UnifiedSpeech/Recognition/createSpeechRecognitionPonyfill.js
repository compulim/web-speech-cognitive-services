import memoize from 'memoize-one';

import DOMEventEmitter from '../DOMEventEmitter';
import SpeechSDK from '../SpeechSDK';

const {
  AudioConfig,
  SpeechRecognizer,
  SpeechTranslationConfig
} = SpeechSDK;

function serializeRecognitionResult({
  duration,
  errorDetails,
  json,
  offset,
  properties,
  reason,
  resultId,
  text
}) {
  return {
    duration,
    errorDetails,
    json,
    offset,
    properties,
    reason,
    resultId,
    text
  };
}

export default ({
  region = 'westus',
  subscriptionKey = ''
} = {}) => {
  const audioConfig = AudioConfig.fromDefaultMicrophoneInput();

  class SpeechRecognition extends DOMEventEmitter {
    constructor() {
      super([
        'audiostart',
        'soundstart',
        'speechstart',
        'speechend',
        'soundend',
        'audioend',
        'result',
        'nomatch',
        'error',
        'start',
        'end',
        'cognitiveservices'
      ]);

      this._continuous = false;
      this._interimResults = false;
      this._lang = typeof window !== 'undefined' ? (window.document.documentElement.getAttribute('lang') || window.navigator.language) : 'en-US';

      this.createRecognizer = memoize(({
        language
      } = {}) => {
        const speechConfig = SpeechTranslationConfig.fromSubscription(subscriptionKey, region);

        speechConfig.speechRecognitionLanguage = language || 'en-US';

        const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

        console.log(speechConfig);

        recognizer.canceled = (_, { errorDetails, offset, reason, sessionId }) => {
          this.emitCognitiveServices('canceled', { errorDetails, offset, reason, sessionId });
        };

        recognizer.recognized = (_, { offset, result, sessionId }) => {
          this.emitCognitiveServices('recognized', { offset, result: serializeRecognitionResult(result), sessionId });
        };

        recognizer.recognizing = (_, { offset, result, sessionId }) => {
          this.emitCognitiveServices('recognizing', { offset, result: serializeRecognitionResult(result), sessionId });
        };

        return recognizer;
      }, null, recognizer => {
        recognizer.dispose();
      });
    }

    emitCognitiveServices(type, event) {
      this.emit('cognitiveservices', {
        ...event,
        subType: type
      });
    }

    get continuous() { return this._continuous; }
    set continuous(value) { this._continuous = value; }

    get interimResults() { return this._interimResults; }
    set interimResults(value) { this._interimResults = value; }

    get maxAlternatives() { return 1; }
    set maxAlternatives(_) { throw new Error('not implemented'); }

    get lang() { return this._lang; }
    set lang(value) { this._lang = value; }

    abort() {
      throw new Error('not implemented');
    }

    start() {
      const recognizer = this._recognizer = this.createRecognizer();
      const onStart = event => {
        console.warn(event);
        this.emit('cognitiveservices', { subType: 'start' });
      };

      const onError = error => {
        console.warn(error);
        this.emit('cognitiveservices', { error, subType: 'error on start' });
      };

      if (this.continuous) {
        console.log('startContinuousRecognitionAsync');
        recognizer.startContinuousRecognitionAsync(onStart, onError);
      } else {
        console.log('recognizeOnceAsync');
        recognizer.recognizeOnceAsync(onStart, onError);
      }
    }

    stop() {
      if (!this._recognizer) {
        // TODO: [P3] Should we throw an error or leave it as-is?
        throw new Error('not started');
      }

      const onStop = event => {
        console.warn(event);
        this.emit('cognitiveservices', { subType: 'stop' });
      };

      const onError = error => {
        console.warn(error);
        this.emit('cognitiveservices', { error, subType: 'error on stop' });
      };

      this._recognizer.stopContinuousRecognitionAsync(onStop, onError);
    }
  }

  return { SpeechRecognition };
}
