/* eslint class-methods-use-this: "off" */
/* eslint complexity: ["error", 70] */
/* eslint no-await-in-loop: "off" */
/* eslint no-empty-function: "off" */
/* eslint no-magic-numbers: ["error", { "ignore": [0, 100, 150] }] */

import createPromiseQueue from '../../Util/createPromiseQueue';
import patchOptions from '../patchOptions';
import SpeechSDK from '../SpeechSDK';
import cognitiveServiceEventResultToWebSpeechRecognitionResult from './cognitiveServiceEventResultToWebSpeechRecognitionResult';
import cognitiveServicesAsyncToPromise from './cognitiveServicesAsyncToPromise';
import EventListenerMap from './EventListenerMap';
import prepareAudioConfig from './private/prepareAudioConfig';
import serializeRecognitionResult from './private/serializeRecognitionResult';
import SpeechGrammarList from './SpeechGrammarList';
import SpeechRecognitionErrorEvent from './SpeechRecognitionErrorEvent';
import SpeechRecognitionEvent from './SpeechRecognitionEvent';
import SpeechRecognitionResultList from './SpeechRecognitionResultList';

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

export function createSpeechRecognitionPonyfillFromRecognizer(
  /** @type {{ createRecognizer: (lang: string) => import('microsoft-cognitiveservices-speech-sdk').SpeechRecognizer; enableTelemetry: boolean; looseEvents: boolean; referenceGrammars: []; textNormalization: 'display' | 'itn' | 'lexical' | 'maskeditn' }} */
  { createRecognizer, enableTelemetry, looseEvents, referenceGrammars, textNormalization }
) {
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

      this.#eventListenerMap = new EventListenerMap(this);
    }

    /** @type { import('./SpeechRecognitionEventListenerMap').SpeechRecognitionEventListenerMap } */
    #eventListenerMap;

    emitCognitiveServices(
      /** @type {string} */
      type,
      /** @type {any} */
      event
    ) {
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

    /** @type { ((event: SpeechRecognitionEvent<'audioend'>) => void) | undefined } */
    get onaudioend() {
      return this.#eventListenerMap.getProperty('audioend');
    }

    set onaudioend(
      /** @type { ((event: SpeechRecognitionEvent<'audioend'>) => void) | undefined } */
      value
    ) {
      this.#eventListenerMap.setProperty('audioend', value);
    }

    /** @type { ((event: SpeechRecognitionEvent<'audiostart'>) => void) | undefined } */
    get onaudiostart() {
      return this.#eventListenerMap.getProperty('audiostart');
    }

    set onaudiostart(
      /** @type { ((event: SpeechRecognitionEvent<'audiostart'>) => void) | undefined } */
      value
    ) {
      this.#eventListenerMap.setProperty('audiostart', value);
    }

    /** @type { ((event: SpeechRecognitionEvent<'cognitiveservices'>) => void) | undefined } */
    get oncognitiveservices() {
      return this.#eventListenerMap.getProperty('cognitiveservices');
    }

    set oncognitiveservices(
      /** @type { ((event: SpeechRecognitionEvent<'cognitiveservices'>) => void) | undefined } */
      value
    ) {
      this.#eventListenerMap.setProperty('cognitiveservices', value);
    }

    /** @type { ((event: SpeechRecognitionEvent<'end'>) => void) | undefined } */
    get onend() {
      return this.#eventListenerMap.getProperty('end');
    }

    set onend(
      /** @type { ((event: SpeechRecognitionEvent<'end'>) => void) | undefined } */
      value
    ) {
      this.#eventListenerMap.setProperty('end', value);
    }

    /** @type { ((event: SpeechRecognitionErrorEvent) => void) | undefined } */
    get onerror() {
      return this.#eventListenerMap.getProperty('error');
    }

    set onerror(
      /** @type { ((event: SpeechRecognitionErrorEvent) => void) | undefined } */
      value
    ) {
      this.#eventListenerMap.setProperty('error', value);
    }

    /** @type { ((event: SpeechRecognitionEvent<'result'>) => void) | undefined } */
    get onresult() {
      return this.#eventListenerMap.getProperty('result');
    }

    set onresult(
      /** @type { ((event: SpeechRecognitionEvent<'result'>) => void) | undefined } */
      value
    ) {
      this.#eventListenerMap.setProperty('result', value);
    }

    /** @type { ((event: SpeechRecognitionEvent<'soundend'>) => void) | undefined } */
    get onsoundend() {
      return this.#eventListenerMap.getProperty('soundend');
    }

    set onsoundend(
      /** @type { ((event: SpeechRecognitionEvent<'soundend'>) => void) | undefined } */
      value
    ) {
      this.#eventListenerMap.setProperty('soundend', value);
    }

    /** @type { ((event: SpeechRecognitionEvent<'soundstart'>) => void) | undefined } */
    get onsoundstart() {
      return this.#eventListenerMap.getProperty('soundstart');
    }

    set onsoundstart(
      /** @type { ((event: SpeechRecognitionEvent<'soundstart'>) => void) | undefined } */
      value
    ) {
      this.#eventListenerMap.setProperty('soundstart', value);
    }

    /** @type { ((event: SpeechRecognitionEvent<'speechend'>) => void) | undefined } */
    get onspeechend() {
      return this.#eventListenerMap.getProperty('speechend');
    }

    set onspeechend(
      /** @type { ((event: SpeechRecognitionEvent<'speechend'>) => void) | undefined } */
      value
    ) {
      this.#eventListenerMap.setProperty('speechend', value);
    }

    /** @type { ((event: SpeechRecognitionEvent<'speechstart'>) => void) | undefined } */
    get onspeechstart() {
      return this.#eventListenerMap.getProperty('speechstart');
    }

    set onspeechstart(
      /** @type { ((event: SpeechRecognitionEvent<'speechstart'>) => void) | undefined } */
      value
    ) {
      this.#eventListenerMap.setProperty('speechstart', value);
    }

    /** @type { ((event: SpeechRecognitionEvent<'start'>) => void) | undefined } */
    get onstart() {
      return this.#eventListenerMap.getProperty('start');
    }

    set onstart(
      /** @type { ((event: SpeechRecognitionEvent<'start'>) => void) | undefined } */
      value
    ) {
      this.#eventListenerMap.setProperty('start', value);
    }

    start() {
      this._startOnce().catch(err => {
        this.dispatchEvent(
          new SpeechRecognitionErrorEvent('error', { error: err, message: err && (err.stack || err.message) })
        );
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

        recognizer.canceled = (
          /** @type {import('microsoft-cognitiveservices-speech-sdk').SpeechRecognizer} */
          _,
          /** @type {import('microsoft-cognitiveservices-speech-sdk').CancellationEventArgs} */
          { errorDetails, offset, reason, sessionId }
        ) => {
          queue.push({
            canceled: {
              errorDetails,
              offset,
              reason,
              sessionId
            }
          });
        };

        recognizer.recognized = (
          /** @type {import('microsoft-cognitiveservices-speech-sdk').SpeechRecognizer} */
          _,
          /** @type {import('microsoft-cognitiveservices-speech-sdk').SpeechRecognitionEventArgs} */
          { offset, result, sessionId }
        ) => {
          queue.push({
            recognized: {
              offset,
              result: serializeRecognitionResult(result),
              sessionId
            }
          });
        };

        recognizer.recognizing = (
          /** @type {import('microsoft-cognitiveservices-speech-sdk').SpeechRecognizer} */
          _,
          /** @type {import('microsoft-cognitiveservices-speech-sdk').SpeechRecognitionEventArgs} */
          { offset, result, sessionId }
        ) => {
          queue.push({
            recognizing: {
              offset,
              result: serializeRecognitionResult(result),
              sessionId
            }
          });
        };

        recognizer.sessionStarted = (
          /** @type {import('microsoft-cognitiveservices-speech-sdk').SpeechRecognizer} */
          _,
          /** @type {import('microsoft-cognitiveservices-speech-sdk').SessionEventArgs} */
          { sessionId }
        ) => {
          queue.push({ sessionStarted: { sessionId } });
        };

        recognizer.sessionStopped = (
          /** @type {import('microsoft-cognitiveservices-speech-sdk').SpeechRecognizer} */
          _,
          /** @type {import('microsoft-cognitiveservices-speech-sdk').SessionEventArgs} */
          { sessionId }
        ) => {
          // "sessionStopped" is never fired, probably because we are using startContinuousRecognitionAsync instead of recognizeOnceAsync.
          queue.push({ sessionStopped: { sessionId } });
        };

        recognizer.speechStartDetected = (
          /** @type {import('microsoft-cognitiveservices-speech-sdk').SpeechRecognizer} */
          _,
          /** @type {import('microsoft-cognitiveservices-speech-sdk').RecognitionEventArgs} */
          { offset, sessionId }
        ) => {
          queue.push({ speechStartDetected: { offset, sessionId } });
        };

        recognizer.speechEndDetected = (
          /** @type {import('microsoft-cognitiveservices-speech-sdk').SpeechRecognizer} */
          _,
          /** @type {import('microsoft-cognitiveservices-speech-sdk').RecognitionEventArgs} */
          { sessionId }
        ) => {
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
        /** @type { import('./SpeechRecognitionErrorEvent').default | import('./SpeechRecognitionEvent').default<'result'> | undefined } */
        let finalEvent;
        /** @type { readonly import('./SpeechRecognitionResult')[] } */
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

            finalEvent = new SpeechRecognitionErrorEvent('error', { error: 'not-allowed' });

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

              finalEvent = new SpeechRecognitionErrorEvent('error', { error: 'network' });
            } else {
              finalEvent = new SpeechRecognitionErrorEvent('error', { error: 'unknown' });
            }

            break;
          } else if (abort || stop) {
            if (abort) {
              finalEvent = new SpeechRecognitionErrorEvent('error', { error: 'aborted' });

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
              // Quirks: 2024-11-19 with Speech SDK 1.41.0
              //   When microphone is muted, `reason` is `NoMatch` (0) in both interactive mode and continuous mode.
              //   After receiving this "recognized but no match" event, both modes will continue to recognize speech with "speechStartDetected" and "recognizing" events.
              //   That means, we need to end this manually in interactive mode, and continuous-but-stopping mode.
              if (!this.continuous || stopping === 'stop') {
                // Empty result will turn into "no-speech" later in the code.
                finalEvent = new SpeechRecognitionEvent('result', {
                  results: new SpeechRecognitionResultList(finalizedResults)
                });

                // Quirks: 2024-11-19 with Speech SDK 1.14.0
                //   Speech SDK did not stop after NoMatch even in interactive mode.
                recognizer.stopContinuousRecognitionAsync &&
                  (await cognitiveServicesAsyncToPromise(recognizer.stopContinuousRecognitionAsync.bind(recognizer))());

                // Quirks: 2024-11-19 with Speech SDK 1.14.0
                //   After calling stopContinuousRecognitionAsync, no "audioSourceOff" is fired.

                break;
              }
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
                const result = cognitiveServiceEventResultToWebSpeechRecognitionResult(recognized.result, {
                  maxAlternatives: this.maxAlternatives,
                  textNormalization
                });

                const recognizable = !!result[0]?.transcript;

                if (recognizable) {
                  finalizedResults = [...finalizedResults, result];

                  this.continuous &&
                    this.dispatchEvent(
                      new SpeechRecognitionEvent('result', {
                        results: new SpeechRecognitionResultList(finalizedResults)
                      })
                    );
                }

                // If it is continuous, we just sent the finalized results. So we don't need to send it again after "audioend" event.
                if (this.continuous && recognizable) {
                  finalEvent = undefined;
                } else {
                  finalEvent = new SpeechRecognitionEvent('result', {
                    results: new SpeechRecognitionResultList(finalizedResults)
                  });
                }

                // If it is interactive, stop after first recognition.
                // If it is continuous and it is stopping, stop it too.
                if ((!this.continuous || stopping === 'stop') && recognizer.stopContinuousRecognitionAsync) {
                  await cognitiveServicesAsyncToPromise(recognizer.stopContinuousRecognitionAsync.bind(recognizer))();
                }

                // If event order can be loosened, we can send the recognized event as soon as we receive it.
                // 1. If it is not recognizable (no-speech), we should send an "error" event just before "end" event. We will not loosen "error" events.
                if (looseEvents && finalEvent && recognizable) {
                  this.dispatchEvent(finalEvent);
                  finalEvent = undefined;
                }
              } else if (recognizing) {
                this.interimResults &&
                  this.dispatchEvent(
                    new SpeechRecognitionEvent('result', {
                      results: new SpeechRecognitionResultList([
                        ...finalizedResults,
                        cognitiveServiceEventResultToWebSpeechRecognitionResult(recognizing.result, {
                          maxAlternatives: this.maxAlternatives,
                          textNormalization
                        })
                      ])
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
            finalEvent = new SpeechRecognitionErrorEvent('error', { error: 'no-speech' });
          }

          this.dispatchEvent(finalEvent);
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

  if (!audioConfig && (!window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia)) {
    console.warn(
      'web-speech-cognitive-services: This browser does not support WebRTC and it will not work with Cognitive Services Speech Services.'
    );

    return {};
  }

  const createRecognizer = async lang => {
    const { authorizationToken, region, speechRecognitionHostname, subscriptionKey } = await fetchCredentials();
    let speechConfig;

    if (speechRecognitionHostname) {
      const host = { hostname: speechRecognitionHostname, port: 443, protocol: 'wss:' };

      if (authorizationToken) {
        speechConfig = SpeechConfig.fromHost(host);
        speechConfig.authorizationToken = authorizationToken;
      } else {
        speechConfig = SpeechConfig.fromHost(host, subscriptionKey);
      }
    } else {
      speechConfig = authorizationToken
        ? SpeechConfig.fromAuthorizationToken(authorizationToken, region)
        : SpeechConfig.fromSubscription(subscriptionKey, region);
    }

    if (speechRecognitionEndpointId) {
      speechConfig.endpointId = speechRecognitionEndpointId;
    }

    speechConfig.outputFormat = OutputFormat.Detailed;
    speechConfig.speechRecognitionLanguage = lang || 'en-US';
    // speechConfig.setProperty(PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, '2000');
    // speechConfig.setProperty(PropertyId.Conversation_Initial_Silence_Timeout, '2000');
    // speechConfig.setProperty(PropertyId.Speech_SegmentationSilenceTimeoutMs, '2000');

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
