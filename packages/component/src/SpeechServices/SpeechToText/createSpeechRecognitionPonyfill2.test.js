jest.useFakeTimers();

import { PromiseHelper } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Promise';
import createDeferred from '../../Util/createDeferred';

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
        emitRead: (chunk = [0xFF, 0xFF]) => {
          // TODO: Rename "emitRead" to more meaningful name
          readResolves.forEach(resolve => resolve(chunk));
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

      this.callRecognizeOnceAsyncDeferred = createDeferred();
      this.callStopContinuousRecognitionAsyncDeferred = createDeferred();
    }

    dispose() {}

    recognizeOnceAsync(...args) {
      this.callRecognizeOnceAsyncDeferred.resolve(args);
    }

    stopContinuousRecognitionAsync(...args) {
      this.callStopContinuousRecognitionAsyncDeferred.resolve(args);
    }

    async readAudioChunk() {
      this.audioConfig.attach().onSuccessContinueWith(reader => reader.read());
    }

    async waitForRecognizeOnceAsync() {
      return await this.callRecognizeOnceAsyncDeferred.promise;
    }

    async waitForStopContinuousRecognitionAsync() {
      return await this.callStopContinuousRecognitionAsyncDeferred.promise;
    }

    async rejectRecognizeOnceAsync(err) {
      return (await this.callRecognizeOnceAsyncDeferred.promise)[1](err);
    }

    async resolveRecognizeOnceAsync(result) {
      return (await this.callRecognizeOnceAsyncDeferred.promise)[0](result);
    }
  }
};

const MOCK_RECOGNIZING_EVENT = {
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
};

const MOCK_RECOGNIZED_EVENT = {
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
};

const MOCK_SUCCESS_RESULT = {
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
};

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
          const results = event.results.map(results => [].map.call(results, ({ transcript }) => transcript));

          return `webspeech:${ type } { isFinal: ${ !!event.results[0].isFinal }, ${ JSON.stringify(results) }`;

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

describe('Mock SpeechRecognizer with', () => {
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

  describe('happy path', () => {
    test('without interims', async () => {
      speechRecognition.start();
      await recognizer.waitForRecognizeOnceAsync();

      // This will fire "firstAudioChunk" on "emitRead"
      recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

      // cognitiveservices:firstAudioChunk
      // webspeech:soundstart

      recognizer.recognizing(this, MOCK_RECOGNIZING_EVENT);

      // cognitiveservices:recognizing
      // webspeech:speechstart

      recognizer.recognized(this, MOCK_RECOGNIZED_EVENT);

      // cognitiveservices:recognized

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend

      recognizer.resolveRecognizeOnceAsync(MOCK_SUCCESS_RESULT);

      // cognitiveservices:success
      // webspeech:result.isFinal=true
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('with 2 interims', async () => {
      speechRecognition.start();
      speechRecognition.interimResults = true;
      await recognizer.waitForRecognizeOnceAsync();

      // This will fire "firstAudioChunk" on "emitRead"
      recognizer.readAudioChunk();

      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

      // cognitiveservices:firstAudioChunk
      // webspeech:soundstart

      recognizer.recognizing(this, MOCK_RECOGNIZING_EVENT);

      // cognitiveservices:recognizing
      // webspeech:speechstart

      recognizer.recognizing(this, MOCK_RECOGNIZING_EVENT);

      // cognitiveservices:recognizing
      // webspeech:result.isFinal=false

      recognizer.recognized(this, MOCK_RECOGNIZED_EVENT);

      // cognitiveservices:recognized

      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:speechend
      // webspeech:soundend
      // webspeech:audioend

      recognizer.resolveRecognizeOnceAsync(MOCK_SUCCESS_RESULT);

      // cognitiveservices:success
      // webspeech:result.isFinal=true
      // webspeech:end

      await endEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });
  });

  test('muted microphone', async () => {
    speechRecognition.start();
    await recognizer.waitForRecognizeOnceAsync();

    // This will fire "firstAudioChunk" on "emitRead"
    recognizer.readAudioChunk();

    recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');
    recognizer.audioConfig.emitRead([0x00, 0x00]);

    // cognitiveservices:audioSourceReady
    // webspeech:start
    // webspeech:audiostart

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

    recognizer.resolveRecognizeOnceAsync({
      duration: 0,
      json: JSON.stringify({
        RecognitionStatus: 'InitialSilenceTimeout',
        Offset: 50000000,
        Duration: 0
      }),
      offset: 50000000,
      reason: 0
    });

    // cognitiveservices:success
    // webspeech:result.isFinal=true
    // webspeech:end

    await errorEventEmitted;

    expect(toSnapshot(events)).toMatchSnapshot();
  });

  test('network error', async () => {
    speechRecognition.start();

    await recognizer.waitForRecognizeOnceAsync();

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

    recognizer.rejectRecognizeOnceAsync('Unable to contact server. StatusCode: 1006, Reason: ');

    await errorEventEmitted;

    expect(toSnapshot(events)).toMatchSnapshot();
  });

  test('microphone blocked', async () => {
    speechRecognition.start();

    await recognizer.waitForRecognizeOnceAsync();

    recognizer.canceled(
      this,
      {
        errorDetails: 'Error occurred during microphone initialization: NotAllowedError: Permission denied',
        reason: 0
      }
    );

    recognizer.rejectRecognizeOnceAsync('Error occurred during microphone initialization: NotAllowedError: Permission denied');

    await errorEventEmitted;

    expect(toSnapshot(events)).toMatchSnapshot();
  });

  describe('abort after', () => {
    test('recognizing', async () => {
      speechRecognition.start();
      await recognizer.waitForRecognizeOnceAsync();

      // This will fire "firstAudioChunk" on "emitRead"
      recognizer.readAudioChunk();
      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

      // cognitiveservices:firstAudioChunk
      // webspeech:soundstart

      recognizer.recognizing(this, MOCK_RECOGNIZING_EVENT);

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
      // webspeech:error
      // webspeech:end

      await errorEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('soundstart', async () => {
      speechRecognition.start();
      await recognizer.waitForRecognizeOnceAsync();

      // This will fire "firstAudioChunk" on "emitRead"
      recognizer.readAudioChunk();
      recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

      // cognitiveservices:audioSourceReady
      // webspeech:start
      // webspeech:audiostart

      recognizer.audioConfig.emitRead();

      // cognitiveservices:firstAudioChunk
      // webspeech:soundstart

      speechRecognition.abort();

      // cognitiveservices:abort

      await recognizer.waitForStopContinuousRecognitionAsync();
      recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

      // cognitiveservices:audioSourceOff
      // webspeech:soundend
      // webspeech:audioend
      // webspeech:error
      // webspeech:end

      await errorEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });

    test('audiostart', async () => {
      speechRecognition.start();
      await recognizer.waitForRecognizeOnceAsync();

      // This will fire "firstAudioChunk" on "emitRead"
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
      // webspeech:error
      // webspeech:end

      await errorEventEmitted;

      expect(toSnapshot(events)).toMatchSnapshot();
    });
  });
});

describe('SpeechRecognizer with text normalization', () => {
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
    await recognizer.waitForRecognizeOnceAsync();

    // This will fire "firstAudioChunk" on "emitRead"
    recognizer.readAudioChunk();

    recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

    // cognitiveservices:audioSourceReady
    // webspeech:start
    // webspeech:audiostart

    recognizer.audioConfig.emitRead();

    // cognitiveservices:firstAudioChunk
    // webspeech:soundstart

    recognizer.recognized(this, { result: RECOGNITION_RESULT });

    // cognitiveservices:recognized
    // webspeech:speechstart

    recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

    // cognitiveservices:audioSourceOff
    // webspeech:speechend
    // webspeech:soundend
    // webspeech:audioend

    recognizer.resolveRecognizeOnceAsync(RECOGNITION_RESULT);

    // cognitiveservices:success
    // webspeech:result.isFinal=true
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
    await recognizer.waitForRecognizeOnceAsync();

    // This will fire "firstAudioChunk" on "emitRead"
    recognizer.readAudioChunk();

    recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

    // cognitiveservices:audioSourceReady
    // webspeech:start
    // webspeech:audiostart

    recognizer.audioConfig.emitRead();

    // cognitiveservices:firstAudioChunk
    // webspeech:soundstart

    recognizer.recognized(this, { result: RECOGNITION_RESULT });

    // cognitiveservices:recognized
    // webspeech:speechstart

    recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

    // cognitiveservices:audioSourceOff
    // webspeech:speechend
    // webspeech:soundend
    // webspeech:audioend

    recognizer.resolveRecognizeOnceAsync(RECOGNITION_RESULT);

    // cognitiveservices:success
    // webspeech:result.isFinal=true
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
    await recognizer.waitForRecognizeOnceAsync();

    // This will fire "firstAudioChunk" on "emitRead"
    recognizer.readAudioChunk();

    recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');

    // cognitiveservices:audioSourceReady
    // webspeech:start
    // webspeech:audiostart

    recognizer.audioConfig.emitRead();

    // cognitiveservices:firstAudioChunk
    // webspeech:soundstart

    recognizer.recognized(this, { result: RECOGNITION_RESULT });

    // cognitiveservices:recognized
    // webspeech:speechstart

    recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

    // cognitiveservices:audioSourceOff
    // webspeech:speechend
    // webspeech:soundend
    // webspeech:audioend

    recognizer.resolveRecognizeOnceAsync(RECOGNITION_RESULT);

    // cognitiveservices:success
    // webspeech:result.isFinal=true
    // webspeech:end

    await endEventEmitted;

    expect(toSnapshot(events)).toMatchSnapshot();
    expect(events[events.length - 2].results[0][0]).toHaveProperty('transcript', 'no (MaskedITN)');
  });
});
