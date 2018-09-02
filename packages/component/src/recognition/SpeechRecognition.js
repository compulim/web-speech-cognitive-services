import * as CognitiveSpeech from 'microsoft-speech-browser-sdk';
import EventAsPromise from 'event-as-promise';
import memoize from 'memoize-one';

import SpeechGrammarList from './SpeechGrammarList';

function buildSpeechResult(transcript, confidence, isFinal) {
  const result = [{ confidence, transcript }];

  result.isFinal = isFinal;

  return { results: [result], type: 'result' };
}

export default class {
  constructor() {
    this._lang = '';

    this.readyState = 0;

    this.onaudiostart = null;
    this.onaudioend = null;
    this.onend = null;
    this.onerror = null;
    this.onnomatch = null;
    this.onresult = null;
    this.onsoundstart = null;
    this.onsoundend = null;
    this.onspeechstart = null;
    this.onspeechend = null;
    this.onstart = null;

    this.createRecognizer = memoize((
      lang = navigator.language,
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
        lang,
        CognitiveSpeech.SpeechResultFormat.Detailed
      );

      const fetchToken = () => {
        try {
          const sink = new CognitiveSpeech.Sink();

          this.speechToken.authorized.then(sink.Resolve, sink.Reject);

          return new CognitiveSpeech.Promise(sink);
        } catch (err) {
          sink.Reject(err.message);
        }
      };

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
  set continuous(nextContinuous) { throw new Error('not supported'); }

  get interimResults() { return true; }
  set interimResults(nextInterimResults) {
    if (!nextInterimResults) {
      throw new Error('not supported');
    }
  }

  get maxAlternatives() { return 1; }
  set maxAlternatives(nextMaxAlternatives) { throw new Error('not supported'); }

  get serviceURI() { return null; }
  set serviceURI(nextServiceURI) { throw new Error('not supported'); }

  abort() {
    // TODO: Should redesign how to stop a recognition session
    //       After abort is called, we should not saw it is a "success", "silent", or "no match"
    const { AudioSource } = this.recognizer || {};

    AudioSource && AudioSource.TurnOff();

    this._aborted = true;
  }

  emit(name, event) {
    const listener = this[`on${ name }`];

    listener && listener.call(this, { ...event, type: name });
  }

  stop() {
    // TODO: Support stop
    throw new Error('not supported');
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

    await promises.recognitionTriggered;

    let error;

    const listeningStarted = await Promise.race([
      promises.listeningStarted,
      promises.recognitionEnded
    ]);

    if (listeningStarted.Name === 'RecognitionEndedEvent') {
      // Possibly not authorized to use microphone
      if (listeningStarted.Status === CognitiveSpeech.RecognitionCompletionStatus.AudioSourceError) {
        error = 'not-allowed';
      } else {
        error = CognitiveSpeech.RecognitionCompletionStatus[listeningStarted.Status];
      }
    } else {
      this.emit('start');

      await promises.connectingToService;

      const recognitionStarted = await Promise.race([
        promises.recognitionStarted,
        promises.recognitionEnded
      ]);

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

        await promises.recognitionEnded;
      } else {
        const speechDetailedPhrase = await Promise.race([
          promises.speechDetailedPhrase,
          promises.recognitionEnded
        ]);

        if (speechDetailedPhrase.Name !== 'RecognitionEndedEvent') {
          const recognitionResult = CognitiveSpeech.RecognitionStatus[speechDetailedPhrase.Result.RecognitionStatus];

          if (recognitionResult === CognitiveSpeech.RecognitionStatus.Success) {
            this.emit('result', buildSpeechResult(speechDetailedPhrase.Result.NBest[0].Display, speechDetailedPhrase.Result.NBest[0].Confidence, true));
          } else if (recognitionResult !== CognitiveSpeech.RecognitionStatus.NoMatch) {
            // Possibly silent or muted
            if (recognitionResult === CognitiveSpeech.RecognitionStatus.InitialSilenceTimeout) {
              error = 'no-speech';
            } else {
              error = speechDetailedPhrase.Result.RecognitionStatus;
            }
          }

          await promises.recognitionEnded;
        }
      }
    }

    error && this.emit('error', { error });
    this.emit('end');
  }
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
