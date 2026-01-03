import { expect } from 'expect';
import { afterEach, beforeEach, describe, mock, test } from 'node:test';
import createDeferred from 'p-defer';

function createLoudArrayBuffer() {
  // Single channel, 16-bit.
  const arrayBuffer = new ArrayBuffer(2);
  const typedArray = new Int16Array(arrayBuffer);

  typedArray.set([32767], 0);

  return arrayBuffer;
}

const LOUD_ARRAY_BUFFER = createLoudArrayBuffer();

const MOCK_SPEECH_SDK = {
  AudioConfig: {
    fromDefaultMicrophoneInput: () => {
      const eventHandlers = [];
      const readResolves = [];
      const onEvent = ({ name }) => eventHandlers.forEach(handler => handler({ name }));

      return {
        attach: async () => ({
          read: () => {
            const { promise, resolve } = createDeferred();

            readResolves.push(resolve);

            return promise;
          }
        }),
        emitEvent: name => onEvent({ name }),
        emitRead: (buffer = LOUD_ARRAY_BUFFER) => {
          // TODO: Rename "emitRead" to more meaningful name
          readResolves.forEach(resolve => resolve({ buffer }));
          readResolves.splice(0);
        },
        events: {
          attach: handler => {
            eventHandlers.push(handler);

            return {
              detach: () => eventHandlers.splice(eventHandlers.indexOf(handler), 1)
            };
          },
          onEvent
        }
      };
    }
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
    fromSubscription: (subscriptionKey, region) => ({
      region,
      subscriptionKey
    })
  },
  SpeechRecognizer: class {
    constructor(speechConfig, audioConfig) {
      this.audioConfig = audioConfig;
      this.speechConfig = speechConfig;
      this.canceled = this.recognized = this.recognizing = () => {};

      this.callStartContinuousRecognitionAsyncDeferred = createDeferred();
      this.callStopContinuousRecognitionAsyncDeferred = createDeferred();

      this.privReco = {
        dynamicGrammar: {
          addPhrase: mock.fn(),
          addReferenceGrammar: mock.fn()
        }
      };
    }

    dispose() {}

    startContinuousRecognitionAsync(callback) {
      this.callStartContinuousRecognitionAsyncDeferred.resolve(callback);
      callback && callback();
    }

    stopContinuousRecognitionAsync(callback) {
      this.callStopContinuousRecognitionAsyncDeferred.resolve(callback);
      callback && callback();
    }

    async readAudioChunk() {
      const reader = await this.audioConfig.attach();

      // We intentionally not awaiting this read().
      // We will await on "soundstart" event later.
      reader.read();
    }

    async waitForStartContinuousRecognitionAsync() {
      return await this.callStartContinuousRecognitionAsyncDeferred.promise;
    }

    async waitForStopContinuousRecognitionAsync() {
      return await this.callStopContinuousRecognitionAsyncDeferred.promise;
    }
  }
};

function createRecognizingEvent(text, { duration = 1, offset = 0 } = {}) {
  return {
    result: {
      duration,
      json: JSON.stringify({
        Duration: duration,
        Offset: offset,
        Text: text
      }),
      offset,
      reason: 2,
      text
    }
  };
}

function createRecognizedEvent(text, { confidence = 0.9, duration = 1, itn, lexical, maskedITN, offset = 0 } = {}) {
  return {
    result: {
      duration,
      json: JSON.stringify({
        Duration: duration,
        Offset: offset,
        NBest: [
          {
            Confidence: confidence,
            Lexical: lexical || text.toLowerCase(),
            ITN: itn || text.toLowerCase(),
            MaskedITN: maskedITN || text.toLowerCase(),
            Display: text
          }
        ]
      }),
      offset: offset,
      reason: 3,
      text
    }
  };
}

const SPEECH_EVENTS = [
  'audioend',
  'audiostart',
  'cognitiveservices',
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
  const push = queue.push.bind(queue);

  for (let eventName of SPEECH_EVENTS) {
    speech.addEventListener(eventName, push);
  }

  return queue;
}

function toSnapshot(events) {
  return events.map(event => {
    const { type } = event;

    if (type === 'cognitiveservices') {
      const {
        data: { type: subType }
      } = event;

      return `${type}:${subType}`;
    } else {
      switch (type) {
        case 'error':
          return `webspeech:error { error: '${event.error}' }`;

        case 'result':
          return `webspeech:result [${Array.from(event.results)
            .map(results =>
              [].map.call(results, ({ transcript }) => `'${transcript}'${results.isFinal ? ' (isFinal)' : ''}`)
            )
            .join(', ')}]`;

        default:
          return `webspeech:${type}`;
      }
    }
  });
}

let constructRecognizerDeferred;
let originalConsole;
let warnings;

beforeEach(() => {
  MOCK_SPEECH_SDK.SpeechRecognizer.enableTelemetry = mock.fn();

  constructRecognizerDeferred = createDeferred();
  originalConsole = console;
  // eslint-disable-next-line no-global-assign
  console = { ...console, warn: (...args) => warnings.push(args) };
  warnings = [];

  mock.reset();
  mock.module('../SpeechSDK.ts', {
    defaultExport: {
      ...MOCK_SPEECH_SDK,
      SpeechRecognizer: class extends MOCK_SPEECH_SDK.SpeechRecognizer {
        constructor(...args) {
          super(...args);

          constructRecognizerDeferred.resolve(this);
        }
      }
    }
  });

  global.ErrorEvent = class {
    constructor(type, extras = {}) {
      this.type = type;

      Object.keys(extras).forEach(name => (this[name] = extras[name]));
    }
  };

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

afterEach(() => {
  // eslint-disable-next-line no-global-assign
  console = originalConsole;
});

describe('SpeechRecognition', () => {
  let endEventEmitted;
  let errorEventEmitted;
  let events;
  let soundStartEmitted;
  let speechRecognition;

  beforeEach(async () => {
    const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
    const { SpeechRecognition } = createSpeechRecognitionPonyfill({
      credentials: {
        region: 'westus',
        subscriptionKey: 'SUBSCRIPTION_KEY'
      }
    });

    speechRecognition = new SpeechRecognition();
    events = captureSpeechEvents(speechRecognition);
    endEventEmitted = new Promise(resolve => speechRecognition.addEventListener('end', resolve));
    errorEventEmitted = new Promise(resolve => speechRecognition.addEventListener('error', resolve));
    soundStartEmitted = new Promise(resolve => speechRecognition.addEventListener('soundstart', resolve));
  });

  describe('in interactive mode', () => {
    test('without interims', async () => {
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognizing(this, createRecognizingEvent('hello world'));

      // cognitiveservices:recognizing
      // webspeech:speechstart

      recognizer.recognized(this, createRecognizedEvent('Hello, World!'));

      // cognitiveservices:recognized

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:result ["Hello, World!" (isFinal)]
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('with interims', async () => {
      speechRecognition.interimResults = true;
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognizing(this, createRecognizingEvent('hello'));

      // cognitiveservices:recognizing
      // webspeech:speechstart
      // webspeech:result ["hello"]

      recognizer.recognizing(this, createRecognizingEvent('hello world'));

      // cognitiveservices:recognizing
      // webspeech:result ["hello world"]

      recognizer.recognized(this, createRecognizedEvent('Hello, World!'));

      // cognitiveservices:recognized

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:result ["Hello, World!" (isFinal)]
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('with muted microphone', async () => {
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead([0x00, 0x00]);

      recognizer.recognized(this, {
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
      });

      // cognitiveservices:recognized

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:audioend
      // webspeech:error { error: 'no-speech' }
      // webspeech:end

      await errorEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('with unrecognizable sound should throw error', async () => {
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognized(this, createRecognizedEvent(''));

      // cognitiveservices:recognized
      // webspeech:speechstart

      speechRecognition.stop();

      // cognitiveservices:stop

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:error { error: 'no-speech' }
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('stop after start', async () => {
      speechRecognition.interimResults = true;
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // webspeech:start

      speechRecognition.stop();

      // cognitiveservices:stop
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('stop after audiostart', async () => {
      speechRecognition.interimResults = true;
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      speechRecognition.stop();

      // cognitiveservices:stop

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:audioend
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('stop after soundstart', async () => {
      speechRecognition.interimResults = true;
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      speechRecognition.stop();

      // cognitiveservices:stop

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('stop after recognizing', async () => {
      speechRecognition.interimResults = true;
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognizing(this, createRecognizingEvent('hello'));

      // cognitiveservices:recognizing
      // webspeech:speechstart
      // webspeech:result ["hello"]

      speechRecognition.stop();

      // cognitiveservices:stop

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('abort after start', async () => {
      speechRecognition.interimResults = true;
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // webspeech:start

      speechRecognition.abort();

      // cognitiveservices:abort
      // webspeech:error { error: 'aborted' }
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('abort after audiostart', async () => {
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();
      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      speechRecognition.abort();

      // cognitiveservices:abort

      await recognizer.waitForStopContinuousRecognitionAsync();
      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:audioend
      // webspeech:error { error: 'aborted' }
      // webspeech:end

      await errorEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('abort after soundstart', async () => {
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();
      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      speechRecognition.abort();

      // cognitiveservices:abort

      await recognizer.waitForStopContinuousRecognitionAsync();
      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:error { error: 'aborted' }
      // webspeech:end

      await errorEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('abort after recognizing', async () => {
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();
      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognizing(this, createRecognizingEvent('hello'));

      // cognitiveservices:recognizing
      // webspeech:speechstart

      speechRecognition.abort();

      // cognitiveservices:abort

      await recognizer.waitForStopContinuousRecognitionAsync();
      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:error { error: 'aborted' }
      // webspeech:end

      await errorEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('abort with lingering recognizing/recognized', async () => {
      speechRecognition.interimResults = true;
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      speechRecognition.abort();

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognizing(this, createRecognizingEvent('hello'));

      // cognitiveservices:recognizing

      recognizer.recognizing(this, createRecognizingEvent('hello world'));

      // cognitiveservices:recognizing

      recognizer.recognized(this, createRecognizedEvent('Hello, World!'));

      // cognitiveservices:recognized

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:error { error: 'aborted' }
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchInlineSnapshot(`
        [
          "cognitiveservices:audioSourceReady",
          "webspeech:start",
          "webspeech:audiostart",
          "cognitiveservices:firstAudibleChunk",
          "webspeech:soundstart",
          "cognitiveservices:abort",
          "cognitiveservices:recognizing",
          "cognitiveservices:recognizing",
          "cognitiveservices:recognized",
          "cognitiveservices:audioSourceOff",
          "webspeech:soundend",
          "webspeech:audioend",
          "webspeech:error { error: 'aborted' }",
          "webspeech:end",
        ]
      `);
    });
  });

  describe('in continuous mode', () => {
    test('with unrecognizable sound should throw error', async () => {
      speechRecognition.start();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognized(this, createRecognizedEvent(''));

      // cognitiveservices:recognized
      // webspeech:speechstart

      speechRecognition.stop();

      // cognitiveservices:stop

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:error { error: 'no-speech' }
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('stop after recognizing', async () => {
      speechRecognition.start();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognizing(this, createRecognizingEvent('hello'));

      // cognitiveservices:recognizing
      // webspeech:speechstart
      // webspeech:result ['hello']

      speechRecognition.stop();

      // cognitiveservices:stop

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('stop after recognized 1 speech and 1 ongoing', async () => {
      speechRecognition.start();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognizing(this, createRecognizingEvent('hello'));

      // cognitiveservices:recognizing
      // webspeech:speechstart
      // webspeech:result ['hello']

      recognizer.recognized(this, createRecognizedEvent('Hello.'));

      // cognitiveservices:recognized
      // webspeech:result ['Hello.' (isFinal)]

      speechRecognition.stop();

      // cognitiveservices:stop

      recognizer.recognized(this, createRecognizedEvent('World.'));

      // cognitiveservices:recognized
      // webspeech:result ['Hello.' (isFinal), 'World.' (isFinal)]

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:result ['Hello.' (isFinal), 'World.' (isFinal)]
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('abort after recognizing', async () => {
      speechRecognition.start();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognizing(this, createRecognizingEvent('hello world'));

      // cognitiveservices:recognizing
      // webspeech:speechstart
      // webspeech:result ['hello world']

      speechRecognition.abort();

      // cognitiveservices:abort

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:error { error: 'aborted' }
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('abort after recognized', async () => {
      speechRecognition.start();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognized(this, createRecognizedEvent('Hello, World!'));

      // cognitiveservices:recognized
      // webspeech:speechstart
      // webspeech:result ['Hello, World!' (isFinal)]

      speechRecognition.abort();

      // cognitiveservices:abort

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:error { error: 'aborted' }
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });
  });

  test('with network error', async () => {
    speechRecognition.start();

    const recognizer = await constructRecognizerDeferred.promise;

    await recognizer.waitForStartContinuousRecognitionAsync();

    recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

    // cognitiveservices:audioSourceReady
    // webspeech:start
    // webspeech:audiostart

    recognizer.canceled(this, {
      errorDetails: 'Unable to contact server. StatusCode: 1006, Reason: ',
      reason: 0
    });

    // cognitiveservices:canceled
    // audioend
    // error
    // end

    await errorEventEmitted;

    expect(toSnapshot(events)).toMatchSnapshot();
  });

  test('with microphone blocked', async () => {
    speechRecognition.start();

    const recognizer = await constructRecognizerDeferred.promise;

    await recognizer.waitForStartContinuousRecognitionAsync();

    recognizer.canceled(this, {
      errorDetails: 'Error occurred during microphone initialization: NotAllowedError: Permission denied',
      reason: 0
    });

    // cognitiveservices:canceled
    // webspeech:error { error: 'not-allowed' }
    // webspeech:end

    await errorEventEmitted;

    expect(toSnapshot(events)).toMatchSnapshot();
  });

  test('with dynamic grammars', async () => {
    const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
    const { SpeechRecognition } = createSpeechRecognitionPonyfill({
      credentials: {
        region: 'westus',
        subscriptionKey: 'SUBSCRIPTION_KEY'
      },
      textNormalization: 'maskeditn'
    });

    let speechRecognition = new SpeechRecognition();

    speechRecognition.grammars.phrases = ['Bellevue'];

    speechRecognition.start();

    const recognizer = await constructRecognizerDeferred.promise;

    await recognizer.waitForStartContinuousRecognitionAsync();

    expect(recognizer.privReco.dynamicGrammar.addPhrase).toHaveBeenCalledTimes(1);
    expect(recognizer.privReco.dynamicGrammar.addPhrase).toHaveBeenCalledWith(['Bellevue']);
  });

  test('with reference grammars', async () => {
    const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
    const { SpeechRecognition } = createSpeechRecognitionPonyfill({
      credentials: {
        region: 'westus',
        subscriptionKey: 'SUBSCRIPTION_KEY'
      },
      referenceGrammars: ['12345678-1234-5678-abcd-12345678abcd'],
      textNormalization: 'maskeditn'
    });

    let speechRecognition = new SpeechRecognition();

    speechRecognition.start();

    const recognizer = await constructRecognizerDeferred.promise;

    await recognizer.waitForStartContinuousRecognitionAsync();

    expect(recognizer.privReco.dynamicGrammar.addReferenceGrammar).toHaveBeenCalledTimes(1);
    expect(recognizer.privReco.dynamicGrammar.addReferenceGrammar).toHaveBeenCalledWith([
      '12345678-1234-5678-abcd-12345678abcd'
    ]);
  });

  test('with new SpeechGrammarList', async () => {
    const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
    const { SpeechGrammarList, SpeechRecognition } = createSpeechRecognitionPonyfill({
      credentials: {
        region: 'westus',
        subscriptionKey: 'SUBSCRIPTION_KEY'
      },
      textNormalization: 'maskeditn'
    });

    let speechRecognition = new SpeechRecognition();

    speechRecognition.grammars = new SpeechGrammarList();
    speechRecognition.start();

    const recognizer = await constructRecognizerDeferred.promise;

    await recognizer.waitForStartContinuousRecognitionAsync();
  });
});

describe('SpeechRecognition with text normalization', () => {
  const RECOGNITION_RESULT = {
    duration: 48100000,
    json: JSON.stringify({
      RecognitionStatus: 'Success',
      Offset: 1800000,
      Duration: 48100000,
      NBest: [
        {
          Confidence: 0.2331869,
          Lexical: 'no (Lexical)',
          ITN: 'no (ITN)',
          MaskedITN: 'no (MaskedITN)',
          Display: 'No.'
        }
      ]
    }),
    offset: 1800000,
    reason: 3
  };

  test('of ITN should result in ITN', async () => {
    const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
    const { SpeechRecognition } = createSpeechRecognitionPonyfill({
      credentials: {
        region: 'westus',
        subscriptionKey: 'SUBSCRIPTION_KEY'
      },
      textNormalization: 'itn'
    });

    let speechRecognition = new SpeechRecognition();
    let events = captureSpeechEvents(speechRecognition);
    let endEventEmitted = new Promise(resolve => speechRecognition.addEventListener('end', resolve));
    let soundStartEmitted = new Promise(resolve => speechRecognition.addEventListener('soundstart', resolve));

    speechRecognition.start();
    speechRecognition.interimResults = true;

    const recognizer = await constructRecognizerDeferred.promise;

    await recognizer.waitForStartContinuousRecognitionAsync();

    // This will fire "firstAudibleChunk" on "emitRead"
    await recognizer.readAudioChunk();

    recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

    // cognitiveservices:audioSourceReady
    // webspeech:start
    // webspeech:audiostart

    recognizer.audioConfig.emitRead();
    await soundStartEmitted;

    // cognitiveservices:firstAudibleChunk
    // webspeech:soundstart

    recognizer.recognized(this, { result: RECOGNITION_RESULT });

    // cognitiveservices:recognized
    // webspeech:speechstart

    recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

    // cognitiveservices:audioSourceOff
    // webspeech:speechend
    // webspeech:soundend
    // webspeech:audioend
    // webspeech:result ['no (ITN)' (isFinal)]
    // webspeech:end

    await endEventEmitted;

    expect(toSnapshot(events)).toMatchSnapshot();
    expect(events[events.length - 2].results[0][0]).toHaveProperty('transcript', 'no (ITN)');
  });

  test('of lexical should result in lexical', async () => {
    const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
    const { SpeechRecognition } = createSpeechRecognitionPonyfill({
      credentials: {
        region: 'westus',
        subscriptionKey: 'SUBSCRIPTION_KEY'
      },
      textNormalization: 'lexical'
    });

    let speechRecognition = new SpeechRecognition();
    let events = captureSpeechEvents(speechRecognition);
    let endEventEmitted = new Promise(resolve => speechRecognition.addEventListener('end', resolve));
    let soundStartEmitted = new Promise(resolve => speechRecognition.addEventListener('soundstart', resolve));

    speechRecognition.start();
    speechRecognition.interimResults = true;

    const recognizer = await constructRecognizerDeferred.promise;

    await recognizer.waitForStartContinuousRecognitionAsync();

    // This will fire "firstAudibleChunk" on "emitRead"
    await recognizer.readAudioChunk();

    recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

    // cognitiveservices:audioSourceReady
    // webspeech:start
    // webspeech:audiostart

    recognizer.audioConfig.emitRead();
    await soundStartEmitted;

    // cognitiveservices:firstAudibleChunk
    // webspeech:soundstart

    recognizer.recognized(this, { result: RECOGNITION_RESULT });

    // cognitiveservices:recognized
    // webspeech:speechstart

    recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

    // cognitiveservices:audioSourceOff
    // webspeech:speechend
    // webspeech:soundend
    // webspeech:audioend
    // webspeech:result ['no (Lexical)' (isFinal)]
    // webspeech:end

    await endEventEmitted;

    expect(toSnapshot(events)).toMatchSnapshot();
    expect(events[events.length - 2].results[0][0]).toHaveProperty('transcript', 'no (Lexical)');
  });

  test('of masked ITN should result in masked ITN', async () => {
    const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
    const { SpeechRecognition } = createSpeechRecognitionPonyfill({
      credentials: {
        region: 'westus',
        subscriptionKey: 'SUBSCRIPTION_KEY'
      },
      textNormalization: 'maskeditn'
    });

    let speechRecognition = new SpeechRecognition();
    let events = captureSpeechEvents(speechRecognition);
    let endEventEmitted = new Promise(resolve => speechRecognition.addEventListener('end', resolve));
    let soundStartEmitted = new Promise(resolve => speechRecognition.addEventListener('soundstart', resolve));

    speechRecognition.start();
    speechRecognition.interimResults = true;

    const recognizer = await constructRecognizerDeferred.promise;

    await recognizer.waitForStartContinuousRecognitionAsync();

    // This will fire "firstAudibleChunk" on "emitRead"
    await recognizer.readAudioChunk();

    recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

    // cognitiveservices:audioSourceReady
    // webspeech:start
    // webspeech:audiostart

    recognizer.audioConfig.emitRead();
    await soundStartEmitted;

    // cognitiveservices:firstAudibleChunk
    // webspeech:soundstart

    recognizer.recognized(this, { result: RECOGNITION_RESULT });

    // cognitiveservices:recognized
    // webspeech:speechstart

    recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

    // cognitiveservices:audioSourceOff
    // webspeech:speechend
    // webspeech:soundend
    // webspeech:audioend
    // webspeech:result ['no (MaskedITN)' (isFinal)]
    // webspeech:end

    await endEventEmitted;

    expect(toSnapshot(events)).toMatchSnapshot();
    expect(events[events.length - 2].results[0][0]).toHaveProperty('transcript', 'no (MaskedITN)');
  });
});

describe('SpeechRecognition with Custom Speech', () => {
  test('should set up SpeechConfig with endpoint ID', async () => {
    const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
    const { SpeechRecognition } = createSpeechRecognitionPonyfill({
      credentials: {
        region: 'westus',
        subscriptionKey: 'SUBSCRIPTION_KEY'
      },
      speechRecognitionEndpointId: '12345678-1234-5678-abcd-12345678abcd'
    });

    const speechRecognition = new SpeechRecognition();

    speechRecognition.start();

    const recognizer = await constructRecognizerDeferred.promise;

    expect(recognizer.speechConfig).toHaveProperty('endpointId', '12345678-1234-5678-abcd-12345678abcd');
  });
});

describe('SpeechRecognition with telemetry', () => {
  test('disabled', async () => {
    const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
    const { SpeechRecognition } = createSpeechRecognitionPonyfill({
      enableTelemetry: false,
      credentials: {
        region: 'westus',
        subscriptionKey: 'SUBSCRIPTION_KEY'
      }
    });

    const speechRecognition = new SpeechRecognition();

    speechRecognition.start();

    expect(MOCK_SPEECH_SDK.SpeechRecognizer.enableTelemetry).toHaveBeenCalledTimes(1);
    expect(MOCK_SPEECH_SDK.SpeechRecognizer.enableTelemetry).toHaveBeenCalledWith(false);
  });

  test('enabled', async () => {
    const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
    const { SpeechRecognition } = createSpeechRecognitionPonyfill({
      enableTelemetry: true,
      credentials: {
        region: 'westus',
        subscriptionKey: 'SUBSCRIPTION_KEY'
      }
    });

    const speechRecognition = new SpeechRecognition();

    speechRecognition.start();

    expect(MOCK_SPEECH_SDK.SpeechRecognizer.enableTelemetry).toHaveBeenCalledTimes(1);
    expect(MOCK_SPEECH_SDK.SpeechRecognizer.enableTelemetry).toHaveBeenCalledWith(true);
  });
});

describe('SpeechRecognition with loosened events', () => {
  let endEventEmitted;
  let errorEventEmitted;
  let events;
  let speechRecognition;
  let soundStartEmitted;

  beforeEach(async () => {
    const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
    const { SpeechRecognition } = createSpeechRecognitionPonyfill({
      credentials: {
        region: 'westus',
        subscriptionKey: 'SUBSCRIPTION_KEY'
      },
      looseEvents: true
    });

    speechRecognition = new SpeechRecognition();
    events = captureSpeechEvents(speechRecognition);
    endEventEmitted = new Promise(resolve => speechRecognition.addEventListener('end', resolve));
    errorEventEmitted = new Promise(resolve => speechRecognition.addEventListener('error', resolve));
    soundStartEmitted = new Promise(resolve => speechRecognition.addEventListener('soundstart', resolve));
  });

  describe('in interactive mode', () => {
    test('without interims', async () => {
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognizing(this, createRecognizingEvent('hello world'));

      // cognitiveservices:recognizing
      // webspeech:speechstart

      recognizer.recognized(this, createRecognizedEvent('Hello, World!'));

      // cognitiveservices:recognized
      // webspeech:result ["Hello, World!" (isFinal)]

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchInlineSnapshot(`
        [
          "cognitiveservices:audioSourceReady",
          "webspeech:start",
          "webspeech:audiostart",
          "cognitiveservices:firstAudibleChunk",
          "webspeech:soundstart",
          "cognitiveservices:recognizing",
          "webspeech:speechstart",
          "cognitiveservices:recognized",
          "webspeech:result ['Hello, World!' (isFinal)]",
          "cognitiveservices:audioSourceOff",
          "webspeech:speechend",
          "webspeech:soundend",
          "webspeech:audioend",
          "webspeech:end",
        ]
      `);
    });

    test('with interims', async () => {
      speechRecognition.interimResults = true;
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognizing(this, createRecognizingEvent('hello'));

      // cognitiveservices:recognizing
      // webspeech:speechstart
      // webspeech:result ["hello"]

      recognizer.recognizing(this, createRecognizingEvent('hello world'));

      // cognitiveservices:recognizing
      // webspeech:result ["hello world"]

      recognizer.recognized(this, createRecognizedEvent('Hello, World!'));

      // cognitiveservices:recognized
      // webspeech:result ["Hello, World!" (isFinal)]

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchInlineSnapshot(`
        [
          "cognitiveservices:audioSourceReady",
          "webspeech:start",
          "webspeech:audiostart",
          "cognitiveservices:firstAudibleChunk",
          "webspeech:soundstart",
          "cognitiveservices:recognizing",
          "webspeech:speechstart",
          "webspeech:result ['hello']",
          "cognitiveservices:recognizing",
          "webspeech:result ['hello world']",
          "cognitiveservices:recognized",
          "webspeech:result ['Hello, World!' (isFinal)]",
          "cognitiveservices:audioSourceOff",
          "webspeech:speechend",
          "webspeech:soundend",
          "webspeech:audioend",
          "webspeech:end",
        ]
      `);
    });

    test('with muted microphone', async () => {
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead([0x00, 0x00]);

      recognizer.recognized(this, {
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
      });

      // cognitiveservices:recognized

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:audioend
      // webspeech:error { error: 'no-speech' }
      // webspeech:end

      await errorEventEmitted;

      expect(toSnapshot(events)).toMatchInlineSnapshot(`
        [
          "cognitiveservices:audioSourceReady",
          "webspeech:start",
          "webspeech:audiostart",
          "cognitiveservices:recognized",
          "webspeech:audioend",
          "webspeech:error { error: 'no-speech' }",
          "webspeech:end",
        ]
      `);
    });

    test('with unrecognizable sound should throw error', async () => {
      speechRecognition.start();

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognized(this, createRecognizedEvent(''));

      // cognitiveservices:recognized
      // webspeech:speechstart

      speechRecognition.stop();

      // cognitiveservices:stop

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:error { error: 'no-speech' }
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchInlineSnapshot(`
        [
          "cognitiveservices:audioSourceReady",
          "webspeech:start",
          "webspeech:audiostart",
          "cognitiveservices:firstAudibleChunk",
          "webspeech:soundstart",
          "cognitiveservices:recognized",
          "webspeech:speechstart",
          "cognitiveservices:stop",
          "cognitiveservices:audioSourceOff",
          "webspeech:speechend",
          "webspeech:soundend",
          "webspeech:audioend",
          "webspeech:error { error: 'no-speech' }",
          "webspeech:end",
        ]
      `);
    });
  });

  describe('in continuous mode', () => {
    test('with unrecognizable sound should throw error', async () => {
      speechRecognition.start();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognized(this, createRecognizedEvent(''));

      // cognitiveservices:recognized
      // webspeech:speechstart

      speechRecognition.stop();

      // cognitiveservices:stop

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:error { error: 'no-speech' }
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchInlineSnapshot(`
        [
          "cognitiveservices:audioSourceReady",
          "webspeech:start",
          "webspeech:audiostart",
          "cognitiveservices:firstAudibleChunk",
          "webspeech:soundstart",
          "cognitiveservices:recognized",
          "webspeech:speechstart",
          "cognitiveservices:stop",
          "cognitiveservices:audioSourceOff",
          "webspeech:speechend",
          "webspeech:soundend",
          "webspeech:audioend",
          "webspeech:error { error: 'no-speech' }",
          "webspeech:end",
        ]
      `);
    });

    test('stop after recognized 1 speech and 1 ongoing', async () => {
      speechRecognition.start();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognizing(this, createRecognizingEvent('hello'));

      // cognitiveservices:recognizing
      // webspeech:speechstart
      // webspeech:result ['hello']

      recognizer.recognized(this, createRecognizedEvent('Hello.'));

      // cognitiveservices:recognized
      // webspeech:result ['Hello.' (isFinal)]

      speechRecognition.stop();

      // cognitiveservices:stop

      recognizer.recognized(this, createRecognizedEvent('World.'));

      // cognitiveservices:recognized
      // webspeech:result ['Hello.' (isFinal), 'World.' (isFinal)]

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:result ['Hello.' (isFinal), 'World.' (isFinal)]
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchInlineSnapshot(`
        [
          "cognitiveservices:audioSourceReady",
          "webspeech:start",
          "webspeech:audiostart",
          "cognitiveservices:firstAudibleChunk",
          "webspeech:soundstart",
          "cognitiveservices:recognizing",
          "webspeech:speechstart",
          "webspeech:result ['hello']",
          "cognitiveservices:recognized",
          "webspeech:result ['Hello.' (isFinal)]",
          "cognitiveservices:stop",
          "cognitiveservices:recognized",
          "webspeech:result ['Hello.' (isFinal), 'World.' (isFinal)]",
          "cognitiveservices:audioSourceOff",
          "webspeech:speechend",
          "webspeech:soundend",
          "webspeech:audioend",
          "webspeech:end",
        ]
      `);
    });

    test('stop after recognized 1 speech', async () => {
      speechRecognition.start();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognizing(this, createRecognizingEvent('hello'));

      // cognitiveservices:recognizing
      // webspeech:speechstart
      // webspeech:result ['hello']

      recognizer.recognized(this, createRecognizedEvent('Hello.'));

      // cognitiveservices:recognized
      // webspeech:result ['Hello.' (isFinal)]

      speechRecognition.stop();

      // cognitiveservices:stop

      recognizer.speechEndDetected(this, {});

      // cognitiveservices:speechEndDetected

      recognizer.recognized(this, {
        offset: 50000000,
        result: {
          duration: 0,
          json: JSON.stringify({
            RecognitionStatus: 5,
            Offset: 50000000,
            Duration: 0
          }),
          offset: 50000000,
          reason: 0 // NoMatch
        }
      });

      // cognitiveservices:recognized
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:result ['Hello.' (isFinal)]
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchInlineSnapshot(`
        [
          "cognitiveservices:audioSourceReady",
          "webspeech:start",
          "webspeech:audiostart",
          "cognitiveservices:firstAudibleChunk",
          "webspeech:soundstart",
          "cognitiveservices:recognizing",
          "webspeech:speechstart",
          "webspeech:result ['hello']",
          "cognitiveservices:recognized",
          "webspeech:result ['Hello.' (isFinal)]",
          "cognitiveservices:stop",
          "cognitiveservices:speechEndDetected",
          "cognitiveservices:recognized",
          "webspeech:speechend",
          "webspeech:soundend",
          "webspeech:audioend",
          "webspeech:result ['Hello.' (isFinal)]",
          "webspeech:end",
        ]
      `);
    });

    test('abort after recognized', async () => {
      speechRecognition.start();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;

      const recognizer = await constructRecognizerDeferred.promise;

      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      await recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();
      await soundStartEmitted;

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognized(this, createRecognizedEvent('Hello, World!'));

      // cognitiveservices:recognized
      // webspeech:speechstart
      // webspeech:result ['Hello, World!' (isFinal)]

      speechRecognition.abort();

      // cognitiveservices:abort

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:error { error: 'aborted' }
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchInlineSnapshot(`
        [
          "cognitiveservices:audioSourceReady",
          "webspeech:start",
          "webspeech:audiostart",
          "cognitiveservices:firstAudibleChunk",
          "webspeech:soundstart",
          "cognitiveservices:recognized",
          "webspeech:speechstart",
          "webspeech:result ['Hello, World!' (isFinal)]",
          "cognitiveservices:abort",
          "cognitiveservices:audioSourceOff",
          "webspeech:speechend",
          "webspeech:soundend",
          "webspeech:audioend",
          "webspeech:error { error: 'aborted' }",
          "webspeech:end",
        ]
      `);
    });
  });
});
