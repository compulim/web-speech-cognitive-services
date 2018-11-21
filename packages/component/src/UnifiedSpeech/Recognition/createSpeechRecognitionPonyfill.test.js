jest.useFakeTimers();

const MOCK_SPEECH_SDK = {
  AudioConfig: {
    fromDefaultMicrophoneInput: () => ({})
  },
  OutputFormat: {
    Detailed: 'DETAILED'
  },
  ResultReason: {
    NoMatch: 0,
    Canceled: 1,
    RecognizingSpeech: 2,
    RecognizedSpeech: 3
  },
  SpeechConfig: {
    fromSubscription: (subscriptionKey, region) => {
      return {
        region,
        subscriptionKey
      };
    }
  },
  SpeechRecognizer: class {
    constructor() {
      this.canceled = this.recognized = this.recognizing = () => {};
    }
  }
};

const SPEECH_EVENTS = [
  'audioend',
  'audiostart',
  'end',
  'error',
  'result',
  'soundend',
  'soundstart',
  'speechend',
  'speechstart',
  'start'
];

function removeKeys(map, keys) {
  return Object.keys(map).reduce((nextMap, key) => {
    if (!keys.includes(key)) {
      nextMap[key] = map[key];
    }

    return nextMap;
  }, {});
}

function captureSpeechEvents(speech) {
  const queue = [];

  for (let eventName of SPEECH_EVENTS) {
    speech.addEventListener(eventName, event => queue.push(removeKeys(event, ['target'])));
  }

  return () => [...queue];
}

beforeEach(() => {
  jest.resetModules();
});

test('Happy path without interims', async () => {
  const recognizedResult = {
    duration: 48100000,
    json: JSON.stringify({
      RecognitionStatus: 'Success',
      Offset: 1800000,
      Duration: 48100000,
      NBest: [{
        Confidence: 0.2331869,
        Lexcial: 'no',
        ITN: 'no',
        MaskedITN: 'no',
        Display: 'No.'
      }]
    }),
    offset: 1800000,
    reason: 3
  };

  jest.setMock('../SpeechSDK', ({
    ...MOCK_SPEECH_SDK,
    SpeechRecognizer: class extends MOCK_SPEECH_SDK.SpeechRecognizer {
      recognizeOnceAsync(success) {
        setImmediate(() => this.recognized(this, { result: recognizedResult }));
        setImmediate(() => success(recognizedResult));
      }
    }
  }));

  const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
  const { SpeechRecognition } = createSpeechRecognitionPonyfill({
    region: 'westus',
    subscriptionKey: 'SUBSCRIPTION_KEY'
  });

  const speechRecognition = new SpeechRecognition();
  const getEvents = captureSpeechEvents(speechRecognition);

  await new Promise(resolve => {
    speechRecognition.addEventListener('end', resolve);
    speechRecognition.start();
    jest.runAllImmediates();
  });

  expect(getEvents()).toMatchSnapshot();
});

test('Muted microphone', async () => {
  jest.setMock('../SpeechSDK', ({
    ...MOCK_SPEECH_SDK,
    SpeechRecognizer: class extends MOCK_SPEECH_SDK.SpeechRecognizer {
      recognizeOnceAsync(success) {
        setImmediate(() => this.recognized(
          this,
          {
            offset: 50000000,
            result: {
              duration: 0,
              json: JSON.stringify({
                RecognitionStatus: 'InitialSilenceTimeout',
                Offset: 50000000,
                Duration: 0
              }),
              offset: 50000000,
              reason: 0
            }
          }
        ));

        setImmediate(() => success({
          duration: 0,
          json: JSON.stringify({
            RecognitionStatus: 'InitialSilenceTimeout',
            Offset: 50000000,
            Duration: 0
          }),
          offset: 50000000,
          reason: 0
        }));
      }
    }
  }));

  const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
  const { SpeechRecognition } = createSpeechRecognitionPonyfill({
    region: 'westus',
    subscriptionKey: 'SUBSCRIPTION_KEY'
  });

  const speechRecognition = new SpeechRecognition();
  const getEvents = captureSpeechEvents(speechRecognition);

  await new Promise(resolve => {
    speechRecognition.addEventListener('error', resolve);
    speechRecognition.start();
    jest.runAllImmediates();
  });

  expect(getEvents()).toMatchSnapshot();
});
