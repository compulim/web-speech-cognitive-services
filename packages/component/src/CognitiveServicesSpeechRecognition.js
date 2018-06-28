import * as CognitiveSpeech from 'microsoft-speech-browser-sdk';
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

  _transitTo(nextReadyState) {
    // console.log(`_transitTo: readyState = ${ this.readyState }, nextReadyState = ${ nextReadyState }`);

    if (nextReadyState > this.readyState) {
      const lifecycleEvents = [
        null,
        null,
        this.onstart,
        this.onaudiostart,
        this.onsoundstart,
        this.onspeechstart,
        this.onspeechend,
        this.onsoundend,
        this.onaudioend,
        this.onend
      ];

      if (
        this.readyState === AUDIO_START
        && nextReadyState >= AUDIO_END
      ) {
        // If soundstart, speechstart, speechend, and soundend are not fired after audiostart,
        // we can skip them and just fire audioend directly
        this.readyState = SOUND_END;
      }

      for (let transition = this.readyState + 1; transition <= nextReadyState; transition++) {
        const eventListener = lifecycleEvents[transition];

        // eventListener && console.log(`Firing "${ EVENT_TYPES[transition] }"`);
        eventListener && eventListener({ type: EVENT_TYPES[transition] });
      }

      if (nextReadyState === END) {
        this.readyState = IDLE;
      } else {
        this.readyState = nextReadyState;
      }
    }
  }

  _handleDetailedPhrase(event) {
    console.log(event);

    this._transitTo(AUDIO_END);

    if (CognitiveSpeech.RecognitionStatus[event.Result.RecognitionStatus] === CognitiveSpeech.RecognitionStatus.Success) {
      const { NBest: nBest } = event.Result;

      this.onresult && this.onresult(buildSpeechResult(event.Result.NBest[0].Display, event.Result.NBest[0].Confidence, true));
    } else {
      this.onerror && this.onerror({ error: event.Result.RecognitionStatus, type: 'error' });
    }
  }

  _handleHypothesis(event) {
    console.log(event);

    this.onresult && this.onresult(buildSpeechResult(event.Result.Text, .5, false));
  }

  abort() {
    const { AudioSource } = this.recognizer || {};

    console.log(`ABORT: ${ AudioSource }`);

    AudioSource && AudioSource.TurnOff();
  }

  handleRecognize(event) {
    try {
      const { Name: name } = event;

      console.log(`handleRecognize: ${ name }`);

      switch (name) {
      case 'ListeningStartedEvent':
        this._transitTo(AUDIO_START);
        break;

      case 'RecognitionEndedEvent':
        if (event.Status !== CognitiveSpeech.RecognitionCompletionStatus.Success) {
          this._transitTo(AUDIO_END);
          this.onerror && this.onerror({ error: CognitiveSpeech.RecognitionCompletionStatus[event.Status], type: 'error' });
        }

        this._transitTo(END);

        break;

      case 'RecognitionStartedEvent':
        this._transitTo(SPEECH_START);
        break;

      case 'RecognitionTriggeredEvent':
        this._transitTo(START);
        break;

      case 'SpeechEndDetectedEvent':
        this._transitTo(SPEECH_END);
        break;

      case 'SpeechStartDetectedEvent':
        this._transitTo(SPEECH_START);
        break;

      case 'SpeechHypothesisEvent':
        this._handleHypothesis(event);
        break;

      case 'SpeechDetailedPhraseEvent':
        this._handleDetailedPhrase(event);
        break;

      case 'ConnectingToServiceEvent':
      case 'SpeechSimplePhraseEvent':
        break;

      default:
        console.warn(`Unexpected event \"${ name }\" from Cognitive Services, please file a bug to https://github.com/compulim/web-speech-cognitive-services`);
        break;
      }
    } catch (err) {
      // Cognitive Services will hide all exceptions thrown in the event listener
      // We need to show it otherwise when exception happen, we will not know what's going on
      console.error(err);
      throw err;
    }
  }

  start() {
    this.recognizer = this.createRecognizer(
      window.localStorage.getItem('SPEECH_KEY'),
      this.lang
    );

    this.recognizer.Recognize(this.handleRecognize.bind(this));
    this._transitTo(START);
  }

  stop() {
    throw new Error('not supported');
  }
}

export default CognitiveServicesSpeechRecognition
