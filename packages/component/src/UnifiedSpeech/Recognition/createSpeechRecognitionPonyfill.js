import memoize from 'memoize-one';

import createPromiseQueue from '../createPromiseQueue';
import cognitiveServiceEventResultToWebSpeechRecognitionResultList from './cognitiveServiceEventResultToWebSpeechRecognitionResultList';
import DOMEventEmitter from '../DOMEventEmitter';
import SpeechSDK from '../SpeechSDK';
import racePromiseMap from '../racePromiseMap';

// https://docs.microsoft.com/en-us/javascript/api/microsoft-cognitiveservices-speech-sdk/speechconfig?view=azure-node-latest#outputformat
// {
//   "RecognitionStatus": "Success",
//   "Offset": 900000,
//   "Duration": 49000000,
//   "NBest": [
//     {
//       "Confidence": 0.738919,
//       "Lexical": "second",
//       "ITN": "second",
//       "MaskedITN": "second",
//       "Display": "Second."
//     }
//   ]
// }

// {
//   "RecognitionStatus": "InitialSilenceTimeout",
//   "Offset": 50000000,
//   "Duration": 0
// }

const {
  AudioConfig,
  OutputFormat,
  SpeechConfig,
  SpeechRecognizer
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
    json: JSON.parse(json),
    offset,
    properties,
    reason,
    resultId,
    text
  };
}

export default ({
  region = 'westus',
  subscriptionKey = 'fcade773a43541ccbb33edeb6b1d30a5'
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
        const speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);

        speechConfig.outputFormat = OutputFormat.Detailed;
        speechConfig.speechRecognitionLanguage = language || 'en-US';

        const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

        // recognizer.canceled = (_, { errorDetails, offset, reason, sessionId }) => {
        //   console.warn('CANCELED');
        //   this.emitCognitiveServices('canceled', { errorDetails, offset, reason, sessionId });
        // };

        // recognizer.recognized = (_, { offset, result, sessionId }) => {
        //   console.warn('RECOGNIZED');
        //   this.emitCognitiveServices('recognized', { offset, result: serializeRecognitionResult(result), sessionId });
        // };

        // recognizer.recognizing = (_, { offset, result, sessionId }) => {
        //   console.warn('RECOGNIZING');
        //   this.emitCognitiveServices('recognizing', { offset, result: serializeRecognitionResult(result), sessionId });
        // };

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

        // TODO: [P2] When to call resolve/reject event?
        recognizer.startContinuousRecognitionAsync(onStart, onError);
      } else {
        this._startOnce().catch(err => console.error(err));
      }
    }

    async _startOnce() {
      const recognizer = this._recognizer = this.createRecognizer();
      const canceled = createPromiseQueue();
      const error = createPromiseQueue();
      const recognizingAndRecognized = createPromiseQueue();
      const success = createPromiseQueue();

      recognizer.canceled = (_, { errorDetails, offset, reason, sessionId }) => {
        canceled.push({
          errorDetails,
          offset,
          reason,
          sessionId
        });
      };

      recognizer.recognized = (_, { offset, result, sessionId }) => {
        recognizingAndRecognized.push({
          offset,
          result: serializeRecognitionResult(result),
          sessionId,
          type: 'recognized'
        });
      };

      recognizer.recognizing = (_, { offset, result, sessionId }) => {
        recognizingAndRecognized.push({
          offset,
          result: serializeRecognitionResult(result),
          sessionId,
          type: 'recognizing'
        });
      };

      recognizer.recognizeOnceAsync(
        result => {
          success.push({ result: serializeRecognitionResult(result) });
        },
        err => {
          error.push({ error: err });
        }
      );

      for (let loop = 0;; loop++) {
        const event = await recognizingAndRecognized.shift();

        if (!loop) {
          this.emit('start');
          this.emit('audiostart');
          this.emit('soundstart');
          this.emit('speechstart');
        }

        switch (event.type) {
          case 'recognized':
            this.emit('speechend');
            this.emit('soundend');
            this.emit('audioend');
            this.emit('result', {
              results: cognitiveServiceEventResultToWebSpeechRecognitionResultList(event.result)
            });

            break;

          case 'recognizing':
            this.emit('result', {
              results: cognitiveServiceEventResultToWebSpeechRecognitionResultList(event.result)
            });

            break;
        }

        if (event.type === 'recognized') {
          break;
        }
      }

      this.emit('end');
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
