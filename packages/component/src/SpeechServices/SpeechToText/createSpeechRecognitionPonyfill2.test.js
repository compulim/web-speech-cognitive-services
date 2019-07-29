jest.useFakeTimers();

import { PromiseHelper } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Promise';
import createDeferred from '../../Util/createDeferred';

function createLoudArrayBuffer() {
  const arrayBuffer = new ArrayBuffer(4);
  const typedArray = new Int16Array(arrayBuffer);

  typedArray.set([32767, 32767], 0);

  return arrayBuffer;
}

const LOUD_ARRAY_BUFFER = createLoudArrayBuffer();

const MOCK_SPEECH_SDK = {
  AudioConfig: {
    fromDefaultMicrophoneInput: () => {
      const eventHandlers = [];
      const readResolves = [];

      return ({
        attach: () => PromiseHelper.fromResult({
          read: () => ({
            onSuccessContinueWith: resolve => readResolves.push(resolve)
          })
        }),
        emitEvent: name => {
          eventHandlers.forEach(handler => handler({ name }));
        },
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
          }
        }
      });
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
    fromSubscription: (subscriptionKey, region) => {
      return {
        region,
        subscriptionKey
      };
    }
  },
  SpeechRecognizer: class {
    constructor(speechConfig, audioConfig) {
      this.audioConfig = audioConfig;
      this.speechConfig = speechConfig;
      this.canceled = this.recognized = this.recognizing = () => {};

      this.callStartContinuousRecognitionAsyncDeferred = createDeferred();
      this.callStopContinuousRecognitionAsyncDeferred = createDeferred();
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
      this.audioConfig.attach().onSuccessContinueWith(reader => reader.read());
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
        NBest: [{
          Confidence: confidence,
          Lexical: lexical || text.toLowerCase(),
          ITN: itn || text.toLowerCase(),
          MaskedITN: maskedITN || text.toLowerCase(),
          Display: text
        }]
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
      const { subType } = event;

      return `${ type }:${ subType }`;
    } else {
      switch (type) {
        case 'error':
          return `webspeech:error { error: '${ event.error }' }`;

        case 'result':
          return `webspeech:result [${ event.results.map(results => [].map.call(results, ({ transcript }) => `'${ transcript }'${ results.isFinal ? ' (isFinal)' : '' }`)).join(', ') }]`;

        default:
          return `webspeech:${ type }`;
      }
    }
  });
}

let recognizer;

beforeEach(() => {
  jest.resetModules();
  jest.setMock('../SpeechSDK', ({
    ...MOCK_SPEECH_SDK,
    SpeechRecognizer: class extends MOCK_SPEECH_SDK.SpeechRecognizer {
      constructor(...args) {
        super(...args);
        recognizer = this;
      }
    }
  }));

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

describe('SpeechSynthesis', () => {
  let endEventEmitted;
  let errorEventEmitted;
  let events;
  let speechRecognition;

  beforeEach(async () => {
    const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
    const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
      region: 'westus',
      subscriptionKey: 'SUBSCRIPTION_KEY'
    });

    speechRecognition = new SpeechRecognition();
    events = captureSpeechEvents(speechRecognition);
    endEventEmitted = new Promise(resolve => speechRecognition.addEventListener('end', resolve));
    errorEventEmitted = new Promise(resolve => speechRecognition.addEventListener('error', resolve));
  });

  describe('in interactive mode', () => {
    test('without interims', async () => {
      speechRecognition.start();
      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

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
      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

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
      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      recognizer.readAudioChunk();

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
      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

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
      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      recognizer.readAudioChunk();

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
      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

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
      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

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
      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      recognizer.readAudioChunk();
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
      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      recognizer.readAudioChunk();
      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

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
      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      recognizer.readAudioChunk();
      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

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
  });

  describe('in continuous mode', () => {
    test('with unrecognizable sound should throw error', async () => {
      speechRecognition.start();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

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
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('stop after recognizing', async () => {
      speechRecognition.start();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

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

    test('stop after recognized 2 speeches', async () => {
      speechRecognition.start();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

      // cognitiveservices:firstAudibleChunk
      // webspeech:soundstart

      recognizer.recognizing(this, createRecognizingEvent('hello'));

      // cognitiveservices:recognizing
      // webspeech:speechstart
      // webspeech:result ['hello']

      recognizer.recognized(this, createRecognizedEvent('Hello.'));

      // cognitiveservices:recognized
      // webspeech:result ['Hello.' (isFinal)]

      recognizer.recognized(this, createRecognizedEvent('World.'));

      // cognitiveservices:recognized
      // webspeech:result ['Hello.' (isFinal), 'World.' (isFinal)]

      speechRecognition.stop();

      // cognitiveservices:stop

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
      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

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
      await recognizer.waitForStartContinuousRecognitionAsync();

      // This will fire "firstAudibleChunk" on "emitRead"
      recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

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

    await recognizer.waitForStartContinuousRecognitionAsync();

    recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

    // cognitiveservices:audioSourceReady
    // webspeech:start
    // webspeech:audiostart

    recognizer.canceled(
      this,
      {
        errorDetails: 'Unable to contact server. StatusCode: 1006, Reason: ',
        reason: 0
      }
    );

    // cognitiveservices:canceled
    // audioend
    // error
    // end

    await errorEventEmitted;

    expect(toSnapshot(events)).toMatchSnapshot();
  });

  test('with microphone blocked', async () => {
    speechRecognition.start();

    await recognizer.waitForStartContinuousRecognitionAsync();

    recognizer.canceled(
      this,
      {
        errorDetails: 'Error occurred during microphone initialization: NotAllowedError: Permission denied',
        reason: 0
      }
    );

    // cognitiveservices:canceled
    // webspeech:error { error: 'not-allowed' }
    // webspeech:end

    await errorEventEmitted;

    expect(toSnapshot(events)).toMatchSnapshot();
  });
});

describe('SpeechSynthesis with text normalization', () => {
  const RECOGNITION_RESULT = {
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

  test('of ITN should result in ITN', async () => {
    const { default: createSpeechRecognitionPonyfill } = require('./createSpeechRecognitionPonyfill');
    const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
      region: 'westus',
      subscriptionKey: 'SUBSCRIPTION_KEY',
      textNormalization: 'itn'
    });

    let speechRecognition = new SpeechRecognition();
    let events = captureSpeechEvents(speechRecognition);
    let endEventEmitted = new Promise(resolve => speechRecognition.addEventListener('end', resolve));

    speechRecognition.start();
    speechRecognition.interimResults = true;
    await recognizer.waitForStartContinuousRecognitionAsync();

    // This will fire "firstAudibleChunk" on "emitRead"
    recognizer.readAudioChunk();

    recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

    // cognitiveservices:audioSourceReady
    // webspeech:start
    // webspeech:audiostart

    recognizer.audioConfig.emitRead();

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
    const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
      region: 'westus',
      subscriptionKey: 'SUBSCRIPTION_KEY',
      textNormalization: 'lexical'
    });

    let speechRecognition = new SpeechRecognition();
    let events = captureSpeechEvents(speechRecognition);
    let endEventEmitted = new Promise(resolve => speechRecognition.addEventListener('end', resolve));

    speechRecognition.start();
    speechRecognition.interimResults = true;
    await recognizer.waitForStartContinuousRecognitionAsync();

    // This will fire "firstAudibleChunk" on "emitRead"
    recognizer.readAudioChunk();

    recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

    // cognitiveservices:audioSourceReady
    // webspeech:start
    // webspeech:audiostart

    recognizer.audioConfig.emitRead();

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
    const { SpeechRecognition } = await createSpeechRecognitionPonyfill({
      region: 'westus',
      subscriptionKey: 'SUBSCRIPTION_KEY',
      textNormalization: 'maskeditn'
    });

    let speechRecognition = new SpeechRecognition();
    let events = captureSpeechEvents(speechRecognition);
    let endEventEmitted = new Promise(resolve => speechRecognition.addEventListener('end', resolve));

    speechRecognition.start();
    speechRecognition.interimResults = true;
    await recognizer.waitForStartContinuousRecognitionAsync();

    // This will fire "firstAudibleChunk" on "emitRead"
    recognizer.readAudioChunk();

    recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

    // cognitiveservices:audioSourceReady
    // webspeech:start
    // webspeech:audiostart

    recognizer.audioConfig.emitRead();

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
