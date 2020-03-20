/* eslint class-methods-use-this: "off" */
/* eslint complexity: ["error", 70] */
/* eslint no-await-in-loop: "off" */
/* eslint no-empty-function: "off" */
/* eslint no-magic-numbers: ["error", { "ignore": [0, 100, 150] }] */

import { defineEventAttribute, EventTarget } from 'event-target-shim-es5';

import cognitiveServiceEventResultToWebSpeechRecognitionResultList from './cognitiveServiceEventResultToWebSpeechRecognitionResultList';
import createPromiseQueue from '../../Util/createPromiseQueue';
import patchOptions from '../patchOptions';
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

const { AudioConfig, OutputFormat, ResultReason, SpeechConfig, SpeechRecognizer } = SpeechSDK;

function serializeRecognitionResult({ duration, errorDetails, json, offset, properties, reason, resultId, text }) {
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

  return (
    [].reduce.call(array, (averageAmplitude, amplitude) => averageAmplitude + Math.abs(amplitude), 0) / array.length
  );
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

function prepareAudioConfig(audioConfig) {
  const originalAttach = audioConfig.attach;
  let firstChunk;
  let muted;

  // We modify "attach" function and detect when audible chunk is read.
  // We will only modify "attach" function once.
  audioConfig.attach = improviseAsync(originalAttach.bind(audioConfig), reader => ({
    ...reader,
    read: improviseAsync(reader.read.bind(reader), chunk => {
      // The magic number 150 is measured by:
      // 1. Set microphone volume to 0
      // 2. Observe the amplitude (100-110) for the first few chunks
      //    (There is a short static caught when turning on the microphone)
      // 3. Set the number a bit higher than the observation

      if (!firstChunk && averageAmplitude(chunk.buffer) > 150) {
        audioConfig.events.onEvent({ name: 'FirstAudibleChunk' });
        firstChunk = true;
      }

      if (muted) {
        return { buffer: new ArrayBuffer(0), isEnd: true, timeReceived: Date.now() };
      }

      return chunk;
    })
  }));

  return {
    audioConfig,
    pause: () => {
      muted = true;
    },
    unprepare: () => {
      audioConfig.attach = originalAttach;
    }
  };
}

export function createSpeechRecognitionPonyfillFromRecognizer({
  createRecognizer,
  enableTelemetry,
  looseEvents,
  referenceGrammars,
  textNormalization
}) {
  // If enableTelemetry is set to null or non-boolean, we will default to true.
  SpeechRecognizer.enableTelemetry(enableTelemetry !== false);

  class SpeechRecognition extends EventTarget {
    constructor() {
      super();

      this._continuous = false;
      this._interimResults = false;
      this._lang =
        typeof window !== 'undefined'
          ? window.document.documentElement.getAttribute('lang') || window.navigator.language
          : 'en-US';
      this._grammars = new SpeechGrammarList();
      this._maxAlternatives = 1;
    }

    emitCognitiveServices(type, event) {
      this.dispatchEvent(
        new SpeechRecognitionEvent('cognitiveservices', {
          data: {
            ...event,
            type
          }
        })
      );
    }

    get continuous() {
      return this._continuous;
    }
    set continuous(value) {
      this._continuous = value;
    }

    get grammars() {
      return this._grammars;
    }
    set grammars(value) {
      if (value instanceof SpeechGrammarList) {
        this._grammars = value;
      } else {
        throw new Error(`The provided value is not of type 'SpeechGrammarList'`);
      }
    }

    get interimResults() {
      return this._interimResults;
    }
    set interimResults(value) {
      this._interimResults = value;
    }

    get maxAlternatives() {
      return this._maxAlternatives;
    }
    set maxAlternatives(value) {
      this._maxAlternatives = value;
    }

    get lang() {
      return this._lang;
    }
    set lang(value) {
      this._lang = value;
    }

    start() {
      this._startOnce().catch(err => {
        this.dispatchEvent(new ErrorEvent('error', { error: err, message: err && err.message }));
      });
    }

    async _startOnce() {
      // TODO: [P2] Should check if recognition is active, we should not start recognition twice
      const recognizer = await createRecognizer(this.lang);

      const { pause, unprepare } = prepareAudioConfig(recognizer.audioConfig);

      try {
        const queue = createPromiseQueue();
        let soundStarted;
        let speechStarted;
        let stopping;

        const { detach: detachAudioConfigEvent } = recognizer.audioConfig.events.attach(event => {
          const { name } = event;

          if (name === 'AudioSourceReadyEvent') {
            queue.push({ audioSourceReady: {} });
          } else if (name === 'AudioSourceOffEvent') {
            queue.push({ audioSourceOff: {} });
          } else if (name === 'FirstAudibleChunk') {
            queue.push({ firstAudibleChunk: {} });
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
          // Update: "speechEndDetected" is fired for DLSpeech.listenOnceAsync()
          queue.push({ speechEndDetected: { sessionId } });
        };

        const { phrases } = this.grammars;

        // HACK: We are using the internal of SpeechRecognizer because they did not expose it
        const { dynamicGrammar } = recognizer.privReco;

        referenceGrammars && referenceGrammars.length && dynamicGrammar.addReferenceGrammar(referenceGrammars);
        phrases && phrases.length && dynamicGrammar.addPhrase(phrases);

        await cognitiveServicesAsyncToPromise(recognizer.startContinuousRecognitionAsync.bind(recognizer))();

        if (recognizer.stopContinuousRecognitionAsync) {
          this.abort = () => queue.push({ abort: {} });
          this.stop = () => queue.push({ stop: {} });
        } else {
          this.abort = this.stop = undefined;
        }

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

              // If we are aborting, we will ignore lingering recognizing/recognized events. But if we are stopping, we need them.
              stopping = 'abort';
            } else {
              // When we pause, we will send { isEnd: true }, Speech Services will send us "recognized" event.
              pause();
              stopping = 'stop';
            }

            // Abort should not be dispatched without support of "stopContinuousRecognitionAsync".
            // But for defensive purpose, we make sure "stopContinuousRecognitionAsync" is available before we can call.
            if (abort && recognizer.stopContinuousRecognitionAsync) {
              await cognitiveServicesAsyncToPromise(recognizer.stopContinuousRecognitionAsync.bind(recognizer))();
            }
          } else if (audioSourceReady) {
            this.dispatchEvent(new SpeechRecognitionEvent('audiostart'));

            audioStarted = true;
          } else if (firstAudibleChunk) {
            this.dispatchEvent(new SpeechRecognitionEvent('soundstart'));

            soundStarted = true;
          } else if (audioSourceOff) {
            // Looks like we don't need this line and all the tests are still working.
            // Guessing probably stopping is already truthy.
            // stopping = true;

            speechStarted && this.dispatchEvent(new SpeechRecognitionEvent('speechend'));
            soundStarted && this.dispatchEvent(new SpeechRecognitionEvent('soundend'));
            audioStarted && this.dispatchEvent(new SpeechRecognitionEvent('audioend'));

            audioStarted = soundStarted = speechStarted = false;

            break;
          } else if (stopping !== 'abort') {
            if (recognized && recognized.result && recognized.result.reason === ResultReason.NoMatch) {
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
                const result = cognitiveServiceEventResultToWebSpeechRecognitionResultList(recognized.result, {
                  maxAlternatives: this.maxAlternatives,
                  textNormalization
                });

                const recognizable = !!result[0].transcript;

                if (recognizable) {
                  finalizedResults = [...finalizedResults, result];

                  this.continuous &&
                    this.dispatchEvent(
                      new SpeechRecognitionEvent('result', {
                        results: finalizedResults
                      })
                    );
                }

                // If it is continuous, we just sent the finalized results. So we don't need to send it again after "audioend" event.
                if (this.continuous && recognizable) {
                  finalEvent = null;
                } else {
                  finalEvent = {
                    results: finalizedResults,
                    type: 'result'
                  };
                }

                if (!this.continuous && recognizer.stopContinuousRecognitionAsync) {
                  await cognitiveServicesAsyncToPromise(recognizer.stopContinuousRecognitionAsync.bind(recognizer))();
                }

                // If event order can be loosened, we can send the recognized event as soon as we receive it.
                // 1. If it is not recognizable (no-speech), we should send an "error" event just before "end" event. We will not loosen "error" events.
                if (looseEvents && finalEvent && recognizable) {
                  this.dispatchEvent(new SpeechRecognitionEvent(finalEvent.type, finalEvent));
                  finalEvent = null;
                }
              } else if (recognizing) {
                this.interimResults &&
                  this.dispatchEvent(
                    new SpeechRecognitionEvent('result', {
                      results: [
                        ...finalizedResults,
                        cognitiveServiceEventResultToWebSpeechRecognitionResultList(recognizing.result, {
                          maxAlternatives: this.maxAlternatives,
                          textNormalization
                        })
                      ]
                    })
                  );
              }
            }
          }
        }

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
      } catch (err) {
        // Logging out the erorr because Speech SDK would fail silently.
        console.error(err);

        throw err;
      } finally {
        unprepare();
        recognizer.dispose();
      }
    }
  }

  defineEventAttribute(SpeechRecognition.prototype, 'audioend');
  defineEventAttribute(SpeechRecognition.prototype, 'audiostart');
  defineEventAttribute(SpeechRecognition.prototype, 'cognitiveservices');
  defineEventAttribute(SpeechRecognition.prototype, 'end');
  defineEventAttribute(SpeechRecognition.prototype, 'error');
  defineEventAttribute(SpeechRecognition.prototype, 'nomatch');
  defineEventAttribute(SpeechRecognition.prototype, 'result');
  defineEventAttribute(SpeechRecognition.prototype, 'soundend');
  defineEventAttribute(SpeechRecognition.prototype, 'soundstart');
  defineEventAttribute(SpeechRecognition.prototype, 'speechend');
  defineEventAttribute(SpeechRecognition.prototype, 'speechstart');
  defineEventAttribute(SpeechRecognition.prototype, 'start');

  return {
    SpeechGrammarList,
    SpeechRecognition,
    SpeechRecognitionEvent
  };
}

export default options => {
  const {
    audioConfig = AudioConfig.fromDefaultMicrophoneInput(),

    // We set telemetry to true to honor the default telemetry settings of Speech SDK
    // https://github.com/Microsoft/cognitive-services-speech-sdk-js#data--telemetry
    enableTelemetry = true,

    fetchCredentials,
    looseEvents,
    referenceGrammars,
    speechRecognitionEndpointId,
    textNormalization = 'display'
  } = patchOptions(options);

  if (!window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
    console.warn(
      'web-speech-cognitive-services: This browser does not support WebRTC and it will not work with Cognitive Services Speech Services.'
    );

    return {};
  }

  const createRecognizer = async lang => {
    const { authorizationToken, region, speechRecognitionURL, subscriptionKey } = await fetchCredentials();

    if (authorizationToken && subscriptionKey) {
      throw new Error(
        'web-speech-cognitive-services: Only either "authorizationToken" or "subscriptionKey" can be specified by fetchCredentials.'
      );
    }

    if (region && speechRecognitionURL) {
      throw new Error(
        'web-speech-cognitive-services: Only either "region" or "speechRecognitionURL" and "speechSynthesisURL" can be specified by fetchCredentials.'
      );
    }

    const speechConfig = speechRecognitionURL
      ? SpeechConfig.fromHost(speechRecognitionURL, authorizationToken || subscriptionKey)
      : authorizationToken
      ? SpeechConfig.fromAuthorizationToken(authorizationToken, region)
      : SpeechConfig.fromSubscription(subscriptionKey, region);

    if (speechRecognitionEndpointId) {
      speechConfig.endpointId = speechRecognitionEndpointId;
    }

    speechConfig.outputFormat = OutputFormat.Detailed;
    speechConfig.speechRecognitionLanguage = lang || 'en-US';

    return new SpeechRecognizer(speechConfig, audioConfig);
  };

  return createSpeechRecognitionPonyfillFromRecognizer({
    audioConfig,
    createRecognizer,
    enableTelemetry,
    looseEvents,
    referenceGrammars,
    textNormalization
  });
};
