import * as CognitiveSpeech from 'microsoft-speech-browser-sdk';
import EventAsPromise from 'event-as-promise';
import memoize from 'memoize-one';

import DOMEventEmitter from '../Util/DOMEventEmitter';
import fetchAuthorizationToken from '../fetchAuthorizationToken';
import SpeechGrammarList from './SpeechGrammarList';

const { NPM_PACKAGE_VERSION: VERSION } = process.env;

function buildSpeechResult(transcript, confidence, isFinal) {
  const result = [{ confidence, transcript }];

  result.isFinal = isFinal;

  return { results: [result], type: 'result' };
}

function bingSpeechPromisify(fn) {
  return () => {
    try {
      const sink = new CognitiveSpeech.Sink();

      fn().then(sink.Resolve, sink.Reject);

      return new CognitiveSpeech.Promise(sink);
    } catch (err) {
      sink.Reject(err.message);
    }
  };
}

export default ({
  authorizationToken,
  subscriptionKey,
  textNormalization
}) => {
  if (!authorizationToken && !subscriptionKey) {
    console.warn('Either authorization token or subscription key must be specified');

    return {};
  } else if (!window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
    console.warn('This browser does not support WebRTC and it will not work with Cognitive Services Speech Services.');

    return {};
  }

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

      this._lang = typeof window !== 'undefined' ? (window.document.documentElement.getAttribute('lang') || window.navigator.language) : 'en-US';

      this.readyState = 0;

      this.createRecognizer = memoize((
        language,
        mode = CognitiveSpeech.RecognitionMode.Interactive,
        osPlatform = window.navigator.userAgent,
        osName = window.navigator.appName,
        osVersion = window.navigator.appVersion,
        deviceManufacturer = 'microsoft-speech-browser-sdk',
        deviceModel = 'web-speech-cognitive-services',
        deviceVersion = VERSION
      ) => {
        const config = new CognitiveSpeech.RecognizerConfig(
          new CognitiveSpeech.SpeechConfig(
            new CognitiveSpeech.Context(
              new CognitiveSpeech.OS(
                osPlatform,
                osName,
                osVersion
              ),
              new CognitiveSpeech.Device(
                deviceManufacturer,
                deviceModel,
                deviceVersion
              )
            )
          ),
          mode,
          language,
          CognitiveSpeech.SpeechResultFormat.Detailed
        );

        let fetchToken;

        if (authorizationToken) {
          fetchToken = bingSpeechPromisify(async () => typeof authorizationToken === 'function' ? await authorizationToken() : authorizationToken);
        } else if (subscriptionKey) {
          fetchToken = bingSpeechPromisify(async () => fetchAuthorizationToken(subscriptionKey));
        }

        return CognitiveSpeech.CreateRecognizer(config, new CognitiveSpeech.CognitiveTokenAuthentication(fetchToken, fetchToken));
      });
    }

    get grammars() { return this._grammars; }
    set grammars(nextGrammars) {
      if (nextGrammars && !(nextGrammars instanceof SpeechGrammarList)) {
        throw new Error('must be instance of SpeechGrammarList from "web-speech-cognitive-services"');
      }

      this._grammars = nextGrammars;
    }

    get lang() { return this._lang; }
    set lang(nextLang) { this._lang = nextLang; }

    get continuous() { return false; }
    set continuous(nextContinuous) { nextContinuous && console.warn(`Bing Speech: Cannot set continuous to ${ nextContinuous }, this feature is not supported.`); }

    get interimResults() { return true; }
    set interimResults(nextInterimResults) { !nextInterimResults && console.warn(`Bing Speech: Cannot set interimResults to ${ nextInterimResults }, this feature is not supported.`); }

    get maxAlternatives() { return 1; }
    set maxAlternatives(nextMaxAlternatives) { nextMaxAlternatives !== 1 && console.warn(`Bing Speech: Cannot set maxAlternatives to ${ nextMaxAlternatives }, this feature is not supported.`); }

    get serviceURI() { return null; }
    set serviceURI(nextServiceURI) { nextServiceURI && console.warn(`Bing Speech: Cannot set serviceURI to ${ nextServiceURI }, this feature is not supported.`); }

    abort() {
      // TODO: Should redesign how to stop a recognition session
      //       After abort is called, we should not saw it is a "success", "silent", or "no match"
      const { AudioSource } = this.recognizer || {};

      AudioSource && AudioSource.TurnOff();

      this._aborted = true;
    }

    emitCognitiveServices(type, event) {
      this.emit('cognitiveservices', {
        ...event,
        subType: type
      });
    }

    stop() {
      // TODO: Support stop

      const { AudioSource } = this.recognizer || {};

      AudioSource && AudioSource.TurnOff();
    }

    async start() {
      const recognizer = this.recognizer = this.createRecognizer(
        this.lang,
        this.osPlatform || window.navigator.userAgent,
        this.osName || window.navigator.appName,
        this.osVersion || window.navigator.appVersion,
        this.deviceManufacturer || 'web-speech-cognitive-services',
        this.deviceModel || 'web-speech-cognitive-services',
        this.deviceVersion || VERSION
      );

      const { eventListener, ...promises } = toPromise();

      const speechContext = this.grammars && this.grammars.createSpeechContext();

      recognizer.Recognize(eventListener, speechContext && JSON.stringify(speechContext));
      this._aborted = false;

      const recognitionTriggered = await promises.recognitionTriggered;

      this.emitCognitiveServices('recognitionTriggered', recognitionTriggered);

      let error;

      const listeningStarted = await Promise.race([
        promises.listeningStarted,
        promises.recognitionEnded
      ]);

      this.emitCognitiveServices(listeningStarted.Name === 'RecognitionEndedEvent' ? 'recognitionEnded' : ' listeningStarted', listeningStarted);

      if (listeningStarted.Name === 'RecognitionEndedEvent') {
        // Possibly not authorized to use microphone
        if (listeningStarted.Status === CognitiveSpeech.RecognitionCompletionStatus.AudioSourceError) {
          error = 'not-allowed';
        } else {
          error = CognitiveSpeech.RecognitionCompletionStatus[listeningStarted.Status];
        }
      } else {
        this.emit('start');

        const connectingToService = await promises.connectingToService;

        this.emitCognitiveServices('connectingToService', connectingToService);

        const recognitionStarted = await Promise.race([
          promises.recognitionStarted,
          promises.recognitionEnded
        ]);

        this.emitCognitiveServices(
          recognitionStarted.Name === 'RecognitionEndedEvent' ? 'recognitionEnded' : 'recognitionStarted',
          recognitionStarted
        );

        this.emit('audiostart');

        if (recognitionStarted.Name === 'RecognitionEndedEvent') {
          // Possibly network error
          if (recognitionStarted.Status === CognitiveSpeech.RecognitionCompletionStatus.ConnectError) {
            error = 'network';
          } else {
            error = CognitiveSpeech.RecognitionCompletionStatus[recognitionStarted.Status];
          }
        } else {
          let gotFirstHypothesis;

          for (;;) {
            const speechHypothesis = await Promise.race([
              promises.getSpeechHypothesisPromise(),
              promises.speechEndDetected
            ]);

            this.emitCognitiveServices(
              speechHypothesis.Name === 'SpeechEndDetectedEvent' ? 'speechEndDetected' : 'speechHypothesis',
              speechHypothesis
            );

            if (speechHypothesis.Name === 'SpeechEndDetectedEvent') {
              break;
            }

            if (!gotFirstHypothesis) {
              gotFirstHypothesis = true;
              this.emit('soundstart');
              this.emit('speechstart');
            }

            this.emit('result', buildSpeechResult(speechHypothesis.Result.Text, .5, false));
          }

          if (gotFirstHypothesis) {
            this.emit('speechend');
            this.emit('soundend');
          }
        }

        this.emit('audioend');

        if (this._aborted) {
          error = 'aborted';

          const recognitionEnded = await promises.recognitionEnded;

          this.emitCognitiveServices('recognitionEnded', recognitionEnded);
        } else {
          const speechDetailedPhrase = await Promise.race([
            promises.speechDetailedPhrase,
            promises.recognitionEnded
          ]);

          this.emitCognitiveServices(
            speechDetailedPhrase.Name === 'RecognitionEndedEvent' ? 'recognitionEnded' : 'speechDetailedPhrase',
            speechDetailedPhrase
          );

          if (speechDetailedPhrase.Name !== 'RecognitionEndedEvent') {
            const recognitionResult = CognitiveSpeech.RecognitionStatus[speechDetailedPhrase.Result.RecognitionStatus];

            if (recognitionResult === CognitiveSpeech.RecognitionStatus.Success) {
              // TODO: [P2] Support maxAlternatives
              const best = speechDetailedPhrase.Result.NBest[0];

              this.emit(
                'result',
                buildSpeechResult(
                  textNormalization === 'itn' ?
                    best.ITN
                  : textNormalization === 'lexical' ?
                    best.Lexical
                  : textNormalization === 'maskeditn' ?
                    best.MaskedITN
                  :
                    best.Display,
                  best.Confidence,
                  true
                )
              );
            } else if (recognitionResult !== CognitiveSpeech.RecognitionStatus.NoMatch) {
              // Possibly silent or muted
              if (recognitionResult === CognitiveSpeech.RecognitionStatus.InitialSilenceTimeout) {
                error = 'no-speech';
              } else {
                error = speechDetailedPhrase.Result.RecognitionStatus;
              }
            }

            const recognitionEnded = await promises.recognitionEnded;

            this.emitCognitiveServices('recognitionEnded', recognitionEnded);
          }
        }
      }

      error && this.emit('error', { error });
      this.emit('end');
    }
  }

  return {
    SpeechGrammarList,
    SpeechRecognition
  };
}

function toPromise() {
  const events = {
    ConnectingToServiceEvent: new EventAsPromise(),
    ListeningStartedEvent: new EventAsPromise(),
    RecognitionEndedEvent: new EventAsPromise(),
    RecognitionStartedEvent: new EventAsPromise(),
    RecognitionTriggeredEvent: new EventAsPromise(),
    SpeechDetailedPhraseEvent: new EventAsPromise(),
    SpeechEndDetectedEvent: new EventAsPromise(),
    SpeechHypothesisEvent: new EventAsPromise(),
    SpeechSimplePhraseEvent: new EventAsPromise(),
    SpeechStartDetectedEvent: new EventAsPromise()
  };

  return {
    connectingToService: events.ConnectingToServiceEvent.upcoming(),
    listeningStarted: events.ListeningStartedEvent.upcoming(),
    recognitionEnded: events.RecognitionEndedEvent.upcoming(),
    recognitionStarted: events.RecognitionStartedEvent.upcoming(),
    recognitionTriggered: events.RecognitionTriggeredEvent.upcoming(),
    speechDetailedPhrase: events.SpeechDetailedPhraseEvent.upcoming(),
    speechEndDetected: events.SpeechEndDetectedEvent.upcoming(),
    getSpeechHypothesisPromise: () => events.SpeechHypothesisEvent.upcoming(),
    speechSimplePhrase: events.SpeechSimplePhraseEvent.upcoming(),
    speechStartDetected: events.SpeechStartDetectedEvent.upcoming(),
    eventListener: event => {
      const { Name: name } = event;
      const eventAsPromise = events[name];

      if (eventAsPromise) {
        eventAsPromise.eventListener.call(null, event);
      } else {
        console.warn(`Unexpected event \"${ name }\" from Cognitive Services, please file a bug to https://github.com/compulim/web-speech-cognitive-services`);
      }
    }
  };
}
