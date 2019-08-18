/* eslint class-methods-use-this: "off" */
/* eslint complexity: ["error", 50] */
/* eslint no-await-in-loop: "off" */
/* eslint no-empty-function: "off" */
/* eslint no-magic-numbers: ["error", { "ignore": [0, 100, 150] }] */

import { defineEventAttribute, EventTarget } from 'event-target-shim';

import cognitiveServiceEventResultToWebSpeechRecognitionResultList from './cognitiveServiceEventResultToWebSpeechRecognitionResultList';
import createPromiseQueue from '../../Util/createPromiseQueue';
import SpeechGrammarList from './SpeechGrammarList';
import SpeechSDK from '../SpeechSDK';

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
  ResultReason,
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

function improviseAsync(fn, improviser) {
  return (...args) => fn(...args).onSuccessContinueWith(result => improviser(result));
}

function averageAmplitude(arrayBuffer) {
  const array = new Int16Array(arrayBuffer);

  return [].reduce.call(array, (averageAmplitude, amplitude) => averageAmplitude + Math.abs(amplitude), 0) / array.length;
}

function cognitiveServicesAsyncToPromise(fn) {
  return (...args) => new Promise((resolve, reject) => fn(...args, resolve, reject));
}

class SpeechRecognitionEvent {
  constructor(type, { data, emma, interpretation, resultIndex, results } = {}) {
    this.data = data;
    this.emma = emma;
    this.interpretation = interpretation;
    this.resultIndex = resultIndex;
    this.results = results;
    this.type = type;
  }
}

export default ({
  audioConfig = AudioConfig.fromDefaultMicrophoneInput(),
  authorizationToken,
  enableTelemetry,
  referenceGrammars,
  region = 'westus',
  speechRecognitionEndpointId,
  subscriptionKey,
  textNormalization = 'display'
} = {}) => {
  if (!authorizationToken && !subscriptionKey) {
    console.warn('Either authorizationToken or subscriptionKey must be specified');

    return {};
  } else if (!window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
    console.warn('This browser does not support WebRTC and it will not work with Cognitive Services Speech Services.');

    return {};
  }

  let onAudibleChunk;
  let muted;

  // We modify "attach" function and detect when audible chunk is read.
  // We will only modify "attach" function once.
  audioConfig.attach = improviseAsync(
    audioConfig.attach.bind(audioConfig),
    reader => ({
      ...reader,
      read: improviseAsync(
        reader.read.bind(reader),
        chunk => {
          // The magic number 150 is measured by:
          // 1. Set microphone volume to 0
          // 2. Observe the amplitude (100-110) for the first few chunks
          //    (This is short static caught when turning on the microphone)
          // 3. Set the number a bit higher than the observation

          if (averageAmplitude(chunk.buffer) > 150) {
            onAudibleChunk && onAudibleChunk();
          }

          if (muted) {
            return { buffer: new ArrayBuffer(0), isEnd: true, timeReceived: Date.now() };
          }

          return chunk;
        }
      )
    })
  );

  SpeechRecognizer.enableTelemetry(enableTelemetry);

  class SpeechRecognition extends EventTarget {
    constructor() {
      super();

      this._continuous = false;
      this._interimResults = false;
      this._lang = typeof window !== 'undefined' ? (window.document.documentElement.getAttribute('lang') || window.navigator.language) : 'en-US';
      this._grammars = new SpeechGrammarList();
      this._maxAlternatives = 1;
    }

    async createRecognizer() {
      const speechConfig = authorizationToken ?
        SpeechConfig.fromAuthorizationToken(typeof authorizationToken === 'function' ? await authorizationToken() : await authorizationToken, region)
      :
        SpeechConfig.fromSubscription(subscriptionKey, region);

      if (speechRecognitionEndpointId) {
        speechConfig.endpointId = speechRecognitionEndpointId;
      }

      speechConfig.outputFormat = OutputFormat.Detailed;
      speechConfig.speechRecognitionLanguage = this.lang || 'en-US';

      return new SpeechRecognizer(speechConfig, audioConfig);
    }

    emitCognitiveServices(type, event) {
      this.dispatchEvent(new SpeechRecognitionEvent('cognitiveservices', {
        data: {
          ...event,
          type
        }
      }));
    }

    get continuous() { return this._continuous; }
    set continuous(value) { this._continuous = value; }

    get grammars() { return this._grammars; }
    set grammars(value) {
      if (value instanceof SpeechGrammarList) {
        this._grammars = value;
      } else {
        throw new Error(`The provided value is not of type 'SpeechGrammarList'`);
      }
    }

    get interimResults() { return this._interimResults; }
    set interimResults(value) { this._interimResults = value; }

    get maxAlternatives() { return this._maxAlternatives; }
    set maxAlternatives(value) { this._maxAlternatives = value; }

    get lang() { return this._lang; }
    set lang(value) { this._lang = value; }

    abort() {}

    start() {
      this._startOnce().catch(err => {
        this.dispatchEvent(new ErrorEvent('error', { error: err, message: err && err.message }));
      });
    }

    async _startOnce() {
      // TODO: [P2] Should check if recognition is active, we should not start recognition twice
      const recognizer = await this.createRecognizer();
      const queue = createPromiseQueue();
      let soundStarted;
      let speechStarted;
      let stopping;

      muted = false;

      onAudibleChunk = () => {
        queue.push({ firstAudibleChunk: {} });
        onAudibleChunk = null;
      };

      const { detach: detachAudioConfigEvent } = recognizer.audioConfig.events.attach(event => {
        const { name } = event;

        if (name === 'AudioSourceReadyEvent') {
          queue.push({ audioSourceReady: {} });
        } else if (name === 'AudioSourceOffEvent') {
          queue.push({ audioSourceOff: {} });
        }
      });

      recognizer.canceled = (_, { errorDetails, offset, reason, sessionId }) => {
        queue.push({
          canceled: {
            errorDetails,
            offset,
            reason,
            sessionId
          }
        });
      };

      recognizer.recognized = (_, { offset, result, sessionId }) => {
        queue.push({
          recognized: {
            offset,
            result: serializeRecognitionResult(result),
            sessionId
          }
        });
      };

      recognizer.recognizing = (_, { offset, result, sessionId }) => {
        queue.push({
          recognizing: {
            offset,
            result: serializeRecognitionResult(result),
            sessionId
          }
        });
      };

      recognizer.sessionStarted = (_, { sessionId }) => {
        queue.push({ sessionStarted: { sessionId } });
      };

      recognizer.sessionStopped = (_, { sessionId }) => {
        // "sessionStopped" is never fired, probably because we are using startContinuousRecognitionAsync instead of recognizeOnceAsync.
        queue.push({ sessionStopped: { sessionId } });
      };

      recognizer.speechStartDetected = (_, { offset, sessionId }) => {
        queue.push({ speechStartDetected: { offset, sessionId } });
      };

      recognizer.speechEndDetected = (_, { sessionId }) => {
        // "speechEndDetected" is never fired, probably because we are using startContinuousRecognitionAsync instead of recognizeOnceAsync.
        queue.push({ speechEndDetected: { sessionId } });
      };

      const { phrases } = this.grammars;

      // HACK: We are using the internal of SpeechRecognizer because they did not expose it
      const { dynamicGrammar } = recognizer.privReco;

      referenceGrammars && referenceGrammars.length && dynamicGrammar.addReferenceGrammar(referenceGrammars);
      phrases && phrases.length && dynamicGrammar.addPhrase(phrases);

      await cognitiveServicesAsyncToPromise(recognizer.startContinuousRecognitionAsync.bind(recognizer))();

      this.abort = () => queue.push({ abort: {} });
      this.stop = () => queue.push({ stop: {} });

      let audioStarted;
      let finalEvent;
      let finalizedResults = [];

      for (let loop = 0; !stopping || audioStarted; loop++) {
        const event = await queue.shift();
        const {
          abort,
          audioSourceOff,
          audioSourceReady,
          canceled,
          firstAudibleChunk,
          recognized,
          recognizing,
          stop
        } = event;

        // We are emitting event "cognitiveservices" for debugging purpose.
        Object.keys(event).forEach(name => this.emitCognitiveServices(name, event[name]));

        const errorMessage = canceled && canceled.errorDetails;

        if (/Permission\sdenied/u.test(errorMessage || '')) {
          // If microphone is not allowed, we should not emit "start" event.

          finalEvent = {
            error: 'not-allowed',
            type: 'error'
          };

          break;
        }

        if (!loop) {
          this.dispatchEvent(new SpeechRecognitionEvent('start'));
        }

        if (errorMessage) {
          if (/1006/u.test(errorMessage)) {
            if (!audioStarted) {
              this.dispatchEvent(new SpeechRecognitionEvent('audiostart'));
              this.dispatchEvent(new SpeechRecognitionEvent('audioend'));
            }

            finalEvent = {
              error: 'network',
              type: 'error'
            };
          } else {
            finalEvent = {
              error: 'unknown',
              type: 'error'
            };
          }

          break;
        } else if (abort || stop) {
          if (abort) {
            finalEvent = {
              error: 'aborted',
              type: 'error'
            };
          } else {
            // When we set to mute and { isEnd: true }, Speech Services will send us "recognized" event.
            muted = true;
          }

          stopping = true;

          if (abort) {
            await cognitiveServicesAsyncToPromise(recognizer.stopContinuousRecognitionAsync.bind(recognizer))();
          }
        } else if (audioSourceReady) {
          this.dispatchEvent(new SpeechRecognitionEvent('audiostart'));

          audioStarted = true;
        } else if (firstAudibleChunk) {
          this.dispatchEvent(new SpeechRecognitionEvent('soundstart'));

          soundStarted = true;
        } else if (audioSourceOff) {
          stopping = true;
          speechStarted && this.dispatchEvent(new SpeechRecognitionEvent('speechend'));
          soundStarted && this.dispatchEvent(new SpeechRecognitionEvent('soundend'));
          audioStarted && this.dispatchEvent(new SpeechRecognitionEvent('audioend'));

          audioStarted = soundStarted = speechStarted = false;

          break;
        } else if (recognized && recognized.result && recognized.result.reason === ResultReason.NoMatch) {
          finalEvent = {
            error: 'no-speech',
            type: 'error'
          };
        } else if (recognized || recognizing) {
          if (!audioStarted) {
            // Unconfirmed prevention of quirks
            this.dispatchEvent(new SpeechRecognitionEvent('audiostart'));

            audioStarted = true;
          }

          if (!soundStarted) {
            this.dispatchEvent(new SpeechRecognitionEvent('soundstart'));

            soundStarted = true;
          }

          if (!speechStarted) {
            this.dispatchEvent(new SpeechRecognitionEvent('speechstart'));

            speechStarted = true;
          }

          if (recognized) {
            const result = cognitiveServiceEventResultToWebSpeechRecognitionResultList(
              recognized.result,
              {
                maxAlternatives: this.maxAlternatives,
                textNormalization
              }
            );

            const recognizable = !!result[0].transcript;

            if (recognizable) {
              finalizedResults = [...finalizedResults, result];

              this.continuous && this.dispatchEvent(new SpeechRecognitionEvent('result', {
                results: finalizedResults
              }));
            }

            finalEvent = {
              results: finalizedResults,
              type: 'result'
            };

            if (!this.continuous) {
              recognizer.stopContinuousRecognitionAsync();
            }
          } else if (recognizing) {
            this.interimResults && this.dispatchEvent(new SpeechRecognitionEvent('result', {
              results: [
                ...finalizedResults,
                cognitiveServiceEventResultToWebSpeechRecognitionResultList(
                  recognizing.result,
                  {
                    maxAlternatives: this.maxAlternatives,
                    textNormalization
                  }
                )
              ]
            }));
          }
        }
      }

      onAudibleChunk = null;

      if (speechStarted) {
        this.dispatchEvent(new SpeechRecognitionEvent('speechend'));
      }

      if (soundStarted) {
        this.dispatchEvent(new SpeechRecognitionEvent('soundend'));
      }

      if (audioStarted) {
        this.dispatchEvent(new SpeechRecognitionEvent('audioend'));
      }

      if (finalEvent) {
        if (finalEvent.type === 'result' && !finalEvent.results.length) {
          finalEvent = {
            error: 'no-speech',
            type: 'error'
          };
        }

        if (finalEvent.type === 'error') {
          this.dispatchEvent(new ErrorEvent('error', finalEvent));
        } else {
          this.dispatchEvent(new SpeechRecognitionEvent(finalEvent.type, finalEvent));
        }
      }

      // Even though there is no "start" event emitted, we will still emit "end" event
      // This is mainly for "microphone blocked" story.
      this.dispatchEvent(new SpeechRecognitionEvent('end'));

      detachAudioConfigEvent();
      recognizer.dispose();
    }

    stop() {}
  }

  defineEventAttribute(
    SpeechRecognition.prototype,
    [
      'audioend',
      'audiostart',
      'cognitiveservices',
      'end',
      'error',
      'nomatch',
      'result',
      'soundend',
      'soundstart',
      'speechend',
      'speechstart',
      'start'
    ]
  );

  return {
    SpeechGrammarList,
    SpeechRecognition,
    SpeechRecognitionEvent
  };
}
