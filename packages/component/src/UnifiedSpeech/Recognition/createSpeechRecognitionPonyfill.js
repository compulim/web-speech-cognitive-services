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

      this.createRecognizer = memoize(({
        language
      } = {}) => {
        const speechConfig = SpeechTranslationConfig.fromSubscription(subscriptionKey, region);

        speechConfig.speechRecognitionLanguage = language || 'en-US';

        const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

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

    get continuous() { return false; }
    set continuous(_) { throw new Error('not implemented'); }

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

      console.log(recognizer);

      // recognizer.recognizeOnceAsync(
      recognizer.startContinuousRecognitionAsync(
        () => {
          this.emit('cognitiveservices', {
            subType: 'start'
          });
        },
        error => {
          this.emit('cognitiveservices', {
            error,
            subType: 'error on start'
          });
        }
      );
    }

    stop() {
      if (!this._recognizer) {
        // TODO: [P3] Should we throw an error or leave it as-is?
        throw new Error('not started');
      }

      this._recognizer.stopContinuousRecognitionAsync(
        () => {
          this.emit('cognitiveservices', {
            subType: 'stop'
          });
        },
        error => {
          this.emit('cognitiveservices', {
            error,
            subType: 'error on stop'
          });
        }
      );
    }
  }

  return { SpeechRecognition };
}
