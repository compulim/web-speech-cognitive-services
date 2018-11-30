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

function captureSpeechEvents(speech, includeCognitiveServicesEvents) {
  const queue = [];

  for (let eventName of SPEECH_EVENTS) {
    speech.addEventListener(eventName, event => queue.push(removeKeys(event, ['target'])));
  }

  if (includeCognitiveServicesEvents) {
    speech.addEventListener('cognitiveservices', event => queue.push({ subType: event.subType, type: event.type }));
  }

  return () => [...queue];
}

beforeEach(() => {
  jest.resetModules();

  global.window = {
    document: {
      documentElement: {
        getAttribute: attributeName => {
          if (attributeName === 'lang') {
            return 'en-US';
          } else {
            throw new Error('not implemented');
          }
        }
      }
    },
    navigator: {
      mediaDevices: {
        getUserMedia: () => {}
      }
    }
  };
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
        Lexical: 'no',
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
  const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
    region: 'westus',
    subscriptionKey: 'SUBSCRIPTION_KEY'
  });

  const speechRecognition = new SpeechRecognition();
  const getEvents = captureSpeechEvents(speechRecognition);

  await new Promise(async resolve => {
    speechRecognition.addEventListener('end', resolve);
    speechRecognition.start();
    await 0;
    jest.runAllImmediates();
  });

  expect(getEvents()).toMatchSnapshot();
});

test('Happy path with 2 interims', async () => {
  jest.setMock('../SpeechSDK', ({
    ...MOCK_SPEECH_SDK,
    SpeechRecognizer: class extends MOCK_SPEECH_SDK.SpeechRecognizer {
      recognizeOnceAsync(success) {
        setImmediate(() => this.recognizing(this, {
          result: {
            duration: 1,
            json: JSON.stringify({
              Duration: 1,
              Offset: 0,
              Text: 'hello'
            }),
            offset: 0,
            reason: 2,
            text: 'hello'
          }
        }));

        setImmediate(() => this.recognizing(this, {
          result: {
            duration: 1,
            json: JSON.stringify({
              Duration: 1,
              Offset: 1,
              Text: 'john'
            }),
            offset: 1,
            reason: 2,
            text: 'john'
          }
        }));

        setImmediate(() => this.recognized(this, {
          result: {
            duration: 2,
            json: JSON.stringify({
              Duration: 2,
              Offset: 0,
              NBest: [{
                Confidence: 0.9,
                Lexical: 'hello john',
                ITN: 'hello John',
                MaskedITN: 'hello John',
                Display: 'Hello, John.'
              }]
            }),
            offset: 0,
            reason: 3,
            text: 'Hello, John.'
          }
        }));

        setImmediate(() => success({
          duration: 2,
          json: JSON.stringify({
            Duration: 2,
            Offset: 0,
            NBest: [{
              Confidence: 0.9,
              Lexical: 'hello john',
              ITN: 'hello John',
              MaskedITN: 'hello John',
              Display: 'Hello, John.'
            }]
          }),
          offset: 0,
          reason: 3,
          text: 'Hello, John.'
        }));
      }
    }
  }));

  const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
  const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
    region: 'westus',
    subscriptionKey: 'SUBSCRIPTION_KEY'
  });

  const speechRecognition = new SpeechRecognition();
  const getEvents = captureSpeechEvents(speechRecognition);

  await new Promise(async resolve => {
    speechRecognition.addEventListener('end', resolve);
    speechRecognition.interimResults = true;
    speechRecognition.start();
    await 0;
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
  const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
    region: 'westus',
    subscriptionKey: 'SUBSCRIPTION_KEY'
  });

  const speechRecognition = new SpeechRecognition();
  const getEvents = captureSpeechEvents(speechRecognition);

  await new Promise(async resolve => {
    speechRecognition.addEventListener('error', resolve);
    speechRecognition.start();
    await 0;
    jest.runAllImmediates();
  });

  expect(getEvents()).toMatchSnapshot();
});

test('Network error before start', async () => {
  // This flow is same as "invalid subscription key".
  // This is because Speech SDK do not distinguish between them and both return with status code 1006.

  jest.setMock('../SpeechSDK', ({
    ...MOCK_SPEECH_SDK,
    SpeechRecognizer: class extends MOCK_SPEECH_SDK.SpeechRecognizer {
      recognizeOnceAsync(_, error) {
        setImmediate(() => this.canceled(
          this,
          {
            errorDetails: 'Unable to contact server. StatusCode: 1006, Reason: ',
            reason: 0
          }
        ));

        setImmediate(() => error('Unable to contact server. StatusCode: 1006, Reason: '));
      }
    }
  }));

  const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
  const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
    region: 'westus',
    subscriptionKey: 'SUBSCRIPTION_KEY'
  });

  const speechRecognition = new SpeechRecognition();
  const getEvents = captureSpeechEvents(speechRecognition);

  await new Promise(async resolve => {
    speechRecognition.addEventListener('end', resolve);
    speechRecognition.start();
    await 0;
    jest.runAllImmediates();
  });

  expect(getEvents()).toMatchSnapshot();
});

test('Microphone blocked', async () => {
  jest.setMock('../SpeechSDK', ({
    ...MOCK_SPEECH_SDK,
    SpeechRecognizer: class extends MOCK_SPEECH_SDK.SpeechRecognizer {
      recognizeOnceAsync(_, error) {
        setImmediate(() => error('Runtime error: \'Error handler for error Error occurred during microphone initialization: NotAllowedError: Permission denied threw error Error: Error occurred during microphone initialization: NotAllowedError: Permission denied\''));
      }
    }
  }));

  const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
  const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
    region: 'westus',
    subscriptionKey: 'SUBSCRIPTION_KEY'
  });

  const speechRecognition = new SpeechRecognition();
  const getEvents = captureSpeechEvents(speechRecognition);

  await new Promise(async resolve => {
    speechRecognition.addEventListener('end', resolve);
    speechRecognition.start();
    await 0;
    jest.runAllImmediates();
  });

  expect(getEvents()).toMatchSnapshot();
});

test('Push-to-talk with partial recognized text', async () => {
  jest.setMock('../SpeechSDK', ({
    ...MOCK_SPEECH_SDK,
    SpeechRecognizer: class extends MOCK_SPEECH_SDK.SpeechRecognizer {
      recognizeOnceAsync(success) {
        setTimeout(() => this.recognizing(this, {
          result: {
            duration: 1,
            json: JSON.stringify({
              Duration: 1,
              Offset: 0,
              Text: 'one'
            }),
            offset: 0,
            reason: 2,
            text: 'one'
          }
        }), 0);

        setTimeout(() => this.recognizing(this, {
          result: {
            duration: 1,
            json: JSON.stringify({
              Duration: 1,
              Offset: 1,
              Text: 'one two'
            }),
            offset: 1,
            reason: 2,
            text: 'one two'
          }
        }), 0);

        setTimeout(() => {
          this.recognizing(this, {
          result: {
            duration: 1,
            json: JSON.stringify({
              Duration: 1,
              Offset: 2,
              Text: 'one two three'
            }),
            offset: 2,
            reason: 2,
            text: 'one two three'
          }
        })
        }, 1000);

        setTimeout(() => this.recognized(this, {
          result: {
            duration: 3,
            json: JSON.stringify({
              RecognitionStatus: 'Success',
              Offset: 0,
              Duration: 3,
              NBest: [{
                Confidence: 0.2,
                Lexcial: 'one two three',
                ITN: '123',
                MaskedITN: '123',
                Display: '123.'
              }]
            }),
            offset: 0,
            reason: 3,
            text: '123.'
          }
        }), 1000);

        setTimeout(() => success({
          duration: 3,
          json: JSON.stringify({
            RecognitionStatus: 'Success',
            Offset: 0,
            Duration: 3,
            NBest: [{
              Confidence: 0.2,
              Lexcial: 'one two three',
              ITN: '123',
              MaskedITN: '123',
              Display: '123.'
            }]
          }),
          offset: 0,
          reason: 3,
          text: '123.'
        }), 1000);
      }
    }
  }));

  const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
  const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
    region: 'westus',
    subscriptionKey: 'SUBSCRIPTION_KEY'
  });

  const speechRecognition = new SpeechRecognition();
  const getEvents = captureSpeechEvents(speechRecognition, true);

  await new Promise(async resolve => {
    speechRecognition.addEventListener('end', resolve);
    speechRecognition.interimResults = true;
    speechRecognition.start();
    await 0;
    jest.advanceTimersByTime(1);
    speechRecognition.stop();
    jest.advanceTimersByTime(1000);
  });

  expect(getEvents()).toMatchSnapshot();
});

test('Push-to-talk stop before first recognized text', async () => {
  jest.setMock('../SpeechSDK', ({
    ...MOCK_SPEECH_SDK,
    SpeechRecognizer: class extends MOCK_SPEECH_SDK.SpeechRecognizer {
      recognizeOnceAsync(success) {
        setTimeout(() => this.recognizing(this, {
          result: {
            duration: 1,
            json: JSON.stringify({
              Duration: 1,
              Offset: 0,
              Text: 'one'
            }),
            offset: 0,
            reason: 2,
            text: 'one'
          }
        }), 1000);

        setTimeout(() => this.recognized(this, {
          result: {
            duration: 3,
            json: JSON.stringify({
              RecognitionStatus: 'Success',
              Offset: 0,
              Duration: 3,
              NBest: [{
                Confidence: 0.2,
                Lexcial: 'one',
                ITN: '1',
                MaskedITN: '1',
                Display: '1.'
              }]
            }),
            offset: 0,
            reason: 3,
            text: '1.'
          }
        }), 1000);

        setTimeout(() => success({
          duration: 3,
          json: JSON.stringify({
            RecognitionStatus: 'Success',
            Offset: 0,
            Duration: 3,
            NBest: [{
              Confidence: 0.2,
              Lexcial: 'one',
              ITN: '1',
              MaskedITN: '1',
              Display: '1.'
            }]
          }),
          offset: 0,
          reason: 3,
          text: '1.'
        }), 1000);
      }
    }
  }));

  const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
  const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
    region: 'westus',
    subscriptionKey: 'SUBSCRIPTION_KEY'
  });

  const speechRecognition = new SpeechRecognition();
  const getEvents = captureSpeechEvents(speechRecognition, true);

  await new Promise(async resolve => {
    speechRecognition.addEventListener('end', resolve);
    speechRecognition.interimResults = true;
    speechRecognition.start();
    await 0;
    jest.advanceTimersByTime(0);
    speechRecognition.stop();
    jest.advanceTimersByTime(1000);
  });

  expect(getEvents()).toMatchSnapshot();
});

test('Abort with partial recognized text', async () => {
  jest.setMock('../SpeechSDK', ({
    ...MOCK_SPEECH_SDK,
    SpeechRecognizer: class extends MOCK_SPEECH_SDK.SpeechRecognizer {
      recognizeOnceAsync(success) {
        setTimeout(() => this.recognizing(this, {
          result: {
            duration: 1,
            json: JSON.stringify({
              Duration: 1,
              Offset: 0,
              Text: 'one'
            }),
            offset: 0,
            reason: 2,
            text: 'one'
          }
        }), 0);

        setTimeout(() => this.recognizing(this, {
          result: {
            duration: 1,
            json: JSON.stringify({
              Duration: 1,
              Offset: 1,
              Text: 'one two'
            }),
            offset: 1,
            reason: 2,
            text: 'one two'
          }
        }), 0);

        setTimeout(() => this.recognizing(this, {
          result: {
            duration: 1,
            json: JSON.stringify({
              Duration: 1,
              Offset: 2,
              Text: 'one two three'
            }),
            offset: 2,
            reason: 2,
            text: 'one two three'
          }
        }), 1000);

        setTimeout(() => this.recognized(this, {
          result: {
            duration: 3,
            json: JSON.stringify({
              RecognitionStatus: 'Success',
              Offset: 0,
              Duration: 3,
              NBest: [{
                Confidence: 0.2,
                Lexcial: 'one two three',
                ITN: '123',
                MaskedITN: '123',
                Display: '123.'
              }]
            }),
            offset: 0,
            reason: 3,
            text: '123.'
          }
        }), 1000);

        setTimeout(() => success({
          duration: 3,
          json: JSON.stringify({
            RecognitionStatus: 'Success',
            Offset: 0,
            Duration: 3,
            NBest: [{
              Confidence: 0.2,
              Lexcial: 'one two three',
              ITN: '123',
              MaskedITN: '123',
              Display: '123.'
            }]
          }),
          offset: 0,
          reason: 3,
          text: '123.'
        }), 1000);
      }
    }
  }));

  const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
  const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
    region: 'westus',
    subscriptionKey: 'SUBSCRIPTION_KEY'
  });

  const speechRecognition = new SpeechRecognition();
  const getEvents = captureSpeechEvents(speechRecognition, true);

  await new Promise(async resolve => {
    speechRecognition.addEventListener('end', resolve);
    speechRecognition.interimResults = true;
    speechRecognition.start();
    await 0;
    jest.advanceTimersByTime(0);
    speechRecognition.abort();
    jest.advanceTimersByTime(1000);
  });

  expect(getEvents()).toMatchSnapshot();
});

test('Abort before first recognized text', async () => {
  jest.setMock('../SpeechSDK', ({
    ...MOCK_SPEECH_SDK,
    SpeechRecognizer: class extends MOCK_SPEECH_SDK.SpeechRecognizer {
      recognizeOnceAsync(success) {
        setTimeout(() => this.recognizing(this, {
          result: {
            duration: 1,
            json: JSON.stringify({
              Duration: 1,
              Offset: 0,
              Text: 'one'
            }),
            offset: 0,
            reason: 2,
            text: 'one'
          }
        }), 1000);

        setTimeout(() => this.recognized(this, {
          result: {
            duration: 3,
            json: JSON.stringify({
              RecognitionStatus: 'Success',
              Offset: 0,
              Duration: 3,
              NBest: [{
                Confidence: 0.2,
                Lexcial: 'one',
                ITN: '1',
                MaskedITN: '1',
                Display: '1.'
              }]
            }),
            offset: 0,
            reason: 3,
            text: '1.'
          }
        }), 1000);

        setTimeout(() => success({
          duration: 3,
          json: JSON.stringify({
            RecognitionStatus: 'Success',
            Offset: 0,
            Duration: 3,
            NBest: [{
              Confidence: 0.2,
              Lexcial: 'one',
              ITN: '1',
              MaskedITN: '1',
              Display: '1.'
            }]
          }),
          offset: 0,
          reason: 3,
          text: '1.'
        }), 1000);
      }
    }
  }));

  const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
  const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
    region: 'westus',
    subscriptionKey: 'SUBSCRIPTION_KEY'
  });

  const speechRecognition = new SpeechRecognition();
  const getEvents = captureSpeechEvents(speechRecognition, true);

  await new Promise(async resolve => {
    speechRecognition.addEventListener('end', resolve);
    speechRecognition.interimResults = true;
    speechRecognition.start();
    await 0;
    jest.advanceTimersByTime(0);
    speechRecognition.abort();
    jest.advanceTimersByTime(1000);
  });

  expect(getEvents()).toMatchSnapshot();
});

test('Happy path with ITN result', async () => {
  const recognizedResult = {
    duration: 48100000,
    json: JSON.stringify({
      RecognitionStatus: 'Success',
      Offset: 1800000,
      Duration: 48100000,
      NBest: [{
        Confidence: 0.2331869,
        Lexical: 'no (Lexical)',
        ITN: 'no (ITN)',
        MaskedITN: 'no (MaskedITN)',
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
  const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
    region: 'westus',
    subscriptionKey: 'SUBSCRIPTION_KEY',
    textNormalization: 'itn'
  });

  const speechRecognition = new SpeechRecognition();
  const getEvents = captureSpeechEvents(speechRecognition);

  await new Promise(async resolve => {
    speechRecognition.addEventListener('end', resolve);
    speechRecognition.start();
    await 0;
    jest.runAllImmediates();
  });

  expect(getEvents()).toMatchSnapshot();
});

test('Happy path with lexical result', async () => {
  const recognizedResult = {
    duration: 48100000,
    json: JSON.stringify({
      RecognitionStatus: 'Success',
      Offset: 1800000,
      Duration: 48100000,
      NBest: [{
        Confidence: 0.2331869,
        Lexical: 'no (Lexical)',
        ITN: 'no (ITN)',
        MaskedITN: 'no (MaskedITN)',
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
  const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
    region: 'westus',
    subscriptionKey: 'SUBSCRIPTION_KEY',
    textNormalization: 'lexical'
  });

  const speechRecognition = new SpeechRecognition();
  const getEvents = captureSpeechEvents(speechRecognition);

  await new Promise(async resolve => {
    speechRecognition.addEventListener('end', resolve);
    speechRecognition.start();
    await 0;
    jest.runAllImmediates();
  });

  expect(getEvents()).toMatchSnapshot();
});

test('Happy path with masked ITN result', async () => {
  const recognizedResult = {
    duration: 48100000,
    json: JSON.stringify({
      RecognitionStatus: 'Success',
      Offset: 1800000,
      Duration: 48100000,
      NBest: [{
        Confidence: 0.2331869,
        Lexical: 'no (Lexical)',
        ITN: 'no (ITN)',
        MaskedITN: 'no (MaskedITN)',
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
  const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
    region: 'westus',
    subscriptionKey: 'SUBSCRIPTION_KEY',
    textNormalization: 'maskeditn'
  });

  const speechRecognition = new SpeechRecognition();
  const getEvents = captureSpeechEvents(speechRecognition);

  await new Promise(async resolve => {
    speechRecognition.addEventListener('end', resolve);
    speechRecognition.start();
    await 0;
    jest.runAllImmediates();
  });

  expect(getEvents()).toMatchSnapshot();
});

test('Happy path with maximum 2 alternatives', async () => {
  const recognizedResult = {
    duration: 48100000,
    json: JSON.stringify({
      RecognitionStatus: 'Success',
      Offset: 1800000,
      Duration: 48100000,
      NBest: [{
        Confidence: 0.9,
        Lexical: 'one',
        ITN: 'one',
        MaskedITN: 'one',
        Display: 'One.'
      }, {
        Confidence: 0.8,
        Lexical: 'two',
        ITN: 'two',
        MaskedITN: 'two',
        Display: 'Two.'
      }, {
        Confidence: 0.7,
        Lexical: 'three',
        ITN: 'three',
        MaskedITN: 'three',
        Display: 'Three.'
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
  const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
    region: 'westus',
    subscriptionKey: 'SUBSCRIPTION_KEY'
  });

  const speechRecognition = new SpeechRecognition();

  speechRecognition.maxAlternatives = 2;

  const getEvents = captureSpeechEvents(speechRecognition);

  await new Promise(async resolve => {
    speechRecognition.addEventListener('end', resolve);
    speechRecognition.start();
    await 0;
    jest.runAllImmediates();
  });

  expect(getEvents()).toMatchSnapshot();
});
