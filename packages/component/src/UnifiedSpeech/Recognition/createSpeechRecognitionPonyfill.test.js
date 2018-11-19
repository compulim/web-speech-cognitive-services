jest.useFakeTimers();

const MOCK_SPEECH_SDK = {
  AudioConfig: {
    fromDefaultMicrophoneInput: () => ({})
  },
  OutputFormat: {
    Detailed: 'DETAILED'
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

function captureSpeechEvents(speech) {
  const queue = [];

  for (let eventName of SPEECH_EVENTS) {
    speech.addEventListener(eventName, event => queue.push(event));
  }

  return () => [...queue];
}

beforeEach(() => {
  jest.resetModules();
});

test('Happy path without interims', async () => {
  const recognizedResult = {
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
