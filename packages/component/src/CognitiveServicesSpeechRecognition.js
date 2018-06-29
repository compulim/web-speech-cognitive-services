import * as CognitiveSpeech from 'microsoft-speech-browser-sdk';
import EventAsPromise from 'event-as-promise';
import memoize from 'memoize-one';

const UNINIT = 0;
const IDLE = 1;
const START = 2;
const AUDIO_START = 3;
const SOUND_START = 4;
const SPEECH_START = 5;
const SPEECH_END = 6;
const SOUND_END = 7;
const AUDIO_END = 8;
const END = 9;

const EVENT_TYPES = [
  null,
  null,
  'start',
  'audiostart',
  'soundstart',
  'speechstart',
  'speechend',
  'soundend',
  'audioend',
  'end'
];

function buildSpeechResult(transcript, confidence, isFinal) {
  const result = [{ confidence, transcript }];

  result.isFinal = isFinal;

  return { results: [result], type: 'result' };
}

class CognitiveServicesSpeechRecognition {
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
      subscriptionKeyOrTokenFetch,
      lang = navigator.language,
      mode = CognitiveSpeech.RecognitionMode.Interactive
    ) => {
      const platform = window.navigator.userAgent;
      const name = 'Browser';
      const osVersion = VERSION;
      const manufacturer = 'web-speech-cognitive-services';
      const model = 'web-speech-cognitive-services';
      const deviceVersion = VERSION;

      const config = new CognitiveSpeech.RecognizerConfig(
        new CognitiveSpeech.SpeechConfig(
          new CognitiveSpeech.Context(
            new CognitiveSpeech.OS(platform, name, osVersion),
            new CognitiveSpeech.Device(manufacturer, model, deviceVersion)
          )
        ),
        mode,
        lang,
        CognitiveSpeech.SpeechResultFormat.Detailed
      );

      let auth;

      if (typeof subscriptionKeyOrTokenFetch === 'function') {
        auth = new CognitiveSpeech.CognitiveTokenAuthentication(
          async authFetchEventID => await subscriptionKeyOrTokenFetch(authFetchEventID, false),
          async authFetchEventID => await subscriptionKeyOrTokenFetch(authFetchEventID, true)
        );
      } else {
        auth = new CognitiveSpeech.CognitiveSubscriptionKeyAuthentication(subscriptionKeyOrTokenFetch);
      }

      return CognitiveSpeech.CreateRecognizer(config, auth);
    });
  }

  get grammars() { return; }
  set grammars(nextGrammars) {
    // throw new Error('not supported');
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
    throw new Error('not supported');
  }

  async start() {
    const recognizer = this.recognizer = this.createRecognizer(
      window.localStorage.getItem('SPEECH_KEY'),
      this.lang
    );

    const { eventListener, ...promises } = toPromise();

    recognizer.Recognize(eventListener);
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

      this.emit('audiostart');

      const recognitionStarted = await Promise.race([
        promises.recognitionStarted,
        promises.recognitionEnded
      ]);

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

      console.log(`handling ${ name }`);

      if (eventAsPromise) {
        eventAsPromise.eventListener.call(null, event);
      } else {
        console.warn(`Unexpected event \"${ name }\" from Cognitive Services, please file a bug to https://github.com/compulim/web-speech-cognitive-services`);
      }
    }
  };
}

export default CognitiveServicesSpeechRecognition
