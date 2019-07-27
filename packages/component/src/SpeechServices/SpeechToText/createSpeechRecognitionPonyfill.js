import cognitiveServiceEventResultToWebSpeechRecognitionResultList from './cognitiveServiceEventResultToWebSpeechRecognitionResultList';
import createPromiseQueue from '../../Util/createPromiseQueue';
import DOMEventEmitter from '../../Util/DOMEventEmitter';
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

function maxAmplitude(chunk) {
  return chunk.reduce((maxAmplitude, value, index) => {
    if (index % 2) {
      return maxAmplitude;
    }

    const amplitude = value + chunk[index + 1] << 8;

    return Math.max(maxAmplitude, amplitude);
  }, 0);
}

export default async ({
  authorizationToken,
  region = 'westus',
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
      this._maxAlternatives = 1;
    }

    async createRecognizer() {
      const speechConfig = authorizationToken ?
        SpeechConfig.fromAuthorizationToken(typeof authorizationToken === 'function' ? await authorizationToken() : await authorizationToken, region)
      :
        SpeechConfig.fromSubscription(subscriptionKey, region);

      speechConfig.outputFormat = OutputFormat.Detailed;
      speechConfig.speechRecognitionLanguage = this.lang || 'en-US';

      return new SpeechRecognizer(speechConfig, audioConfig);
    }

    emitCognitiveServices(type, event) {
      this.emit('cognitiveservices', {
        ...event,
        subType: type
      });
    }

    get continuous() { return this._continuous; }
    set continuous(value) { value && console.warn(`Speech Services: Cannot set continuous to ${ value }, this feature is not supported.`); }

    get interimResults() { return this._interimResults; }
    set interimResults(value) { this._interimResults = value; }

    get maxAlternatives() { return this._maxAlternatives; }
    set maxAlternatives(value) { this._maxAlternatives = value; }

    get lang() { return this._lang; }
    set lang(value) { this._lang = value; }

    abort() {}

    start() {
      if (this.continuous) {
        throw new Error('Continuous mode is not supported.');
      } else {
        this._startOnce().catch(err => {
          console.error(err);
          this.emit('error', { error: err, message: err && err.message });
        });
      }
    }

    async _startOnce() {
      // TODO: [P2] Should check if recognition is active, we should not start recognition twice
      const recognizer = await this.createRecognizer();
      const queue = createPromiseQueue();
      let lastRecognizingResults;
      let soundStarted;
      let speechStarted;
      let stopping;
      let aborting;

      // We modify "attach" function and detect when the first chunk is read.
      recognizer.audioConfig.attach = improviseAsync(
        recognizer.audioConfig.attach.bind(recognizer.audioConfig),
        reader => {
          let chunkRead;

          return {
            ...reader,
            read: improviseAsync(
              reader.read.bind(reader),
              chunk => {
                if (!chunkRead && maxAmplitude(chunk) > 256) {
                  queue.push({ firstAudibleChunk: {} });
                  chunkRead = true;
                }

                return chunk;
              }
            )
          };
        }
      );

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

      recognizer.recognizeOnceAsync(
        result => queue.push({ success: serializeRecognitionResult(result) }),
        err => queue.push({ error: err })
      );

      this.abort = () => queue.push({ abort: {} });
      this.stop = () => queue.push({ stop: {} });

      let audioStarted;
      let finalEvent;

      for (let loop = 0;; loop++) {
        const event = await queue.shift();
        const {
          abort,
          audioSourceOff,
          audioSourceReady,
          canceled,
          error,
          firstAudibleChunk,
          recognized,
          recognizing,
          stop,
          success
        } = event;

        // We are emitting event "cognitiveservices" for debugging purpose
        Object.keys(event).forEach(name => this.emitCognitiveServices(name, event[name]));

        let errorMessage = error ? error : canceled && canceled.errorDetails;

        if (errorMessage && /Permission\sdenied/.test(errorMessage)) {
          finalEvent = {
            error: 'not-allowed',
            type: 'error'
          };

          break;
        }

        if (!loop) {
          this.emit('start');
        }

        if (errorMessage) {
          if (/1006/.test(errorMessage)) {
            if (!audioStarted) {
              this.emit('audiostart');
              this.emit('audioend');
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
        } else if (abort) {
          finalEvent = {
            error: 'aborted',
            type: 'error'
          };

          aborting = true;

          // Quirks: after we call stopContinuousRecognitionAsync, the recognizeOnceAsync will stale and would not resolve or reject.
          recognizer.stopContinuousRecognitionAsync();
        } else if (stop) {
          // This is for faking stop
          stopping = true;

          if (lastRecognizingResults) {
            lastRecognizingResults.isFinal = true;

            finalEvent = {
              results: lastRecognizingResults,
              type: 'result'
            };
          }

          // We want to emit "speechend" and "soundend" as soon as "abort" or "stop" is called.
          if (speechStarted) {
            this.emit('speechend');

            speechStarted = false;
          }

          if (soundStarted) {
            this.emit('soundend');

            soundStarted = false;
          }
        } else if (!stopping) {
          // If we did not faking stop
          if (audioSourceReady) {
            this.emit('audiostart');

            audioStarted = true;
          } else if (firstAudibleChunk) {
            this.emit('soundstart');

            soundStarted = true;
          } else if (audioSourceOff) {
            stopping = true;
            speechStarted && this.emit('speechend');
            soundStarted && this.emit('soundend');
            audioStarted && this.emit('audioend');

            audioStarted = soundStarted = speechStarted = false;

            if (aborting) {
              break;
            }
          } else if (recognized && recognized.result && recognized.result.reason === ResultReason.NoMatch) {
            finalEvent = {
              error: 'no-speech',
              type: 'error'
            };
          } else {
            if (!audioStarted) {
              // Unconfirmed prevention of quirks
              this.emit('audiostart');

              audioStarted = true;
            }

            if (!soundStarted) {
              this.emit('soundstart');

              soundStarted = true;
            }

            if (!speechStarted) {
              this.emit('speechstart');

              speechStarted = true;
            }

            if (recognized) {
              finalEvent = {
                results: cognitiveServiceEventResultToWebSpeechRecognitionResultList(
                  recognized.result,
                  {
                    maxAlternatives: this.maxAlternatives,
                    textNormalization
                  }
                ),
                type: 'result'
              };

              // We should not need this break because we should receive `audioSourceOff` shortly.
              // break;
            } else if (recognizing) {
              lastRecognizingResults = cognitiveServiceEventResultToWebSpeechRecognitionResultList(
                recognizing.result,
                {
                  maxAlternatives: this.maxAlternatives,
                  textNormalization
                }
              );

              this.interimResults && this.emit('result', {
                results: lastRecognizingResults
              });
            }
          }
        }

        if (error || success) {
          break;
        }
      }

      // TODO: We should emit "audioend", "result", or "error" here
      //       This is for mimicking stop() behavior, "audioend" should not fire too early until we received the last "recognized" event

      if (speechStarted) {
        this.emit('speechend');
      }

      if (soundStarted) {
        this.emit('soundend');
      }

      if (audioStarted) {
        this.emit('audioend');
      }

      if (finalEvent) {
        this.emit(finalEvent.type, finalEvent);
      }

      // Even though there is no "start" event emitted, we will still emit "end" event
      // This is mainly for "microphone blocked" story.
      this.emit('end');

      detachAudioConfigEvent();
      recognizer.dispose();
    }

    stop() {}
  }

  return {
    SpeechGrammarList,
    SpeechRecognition
  };
}
