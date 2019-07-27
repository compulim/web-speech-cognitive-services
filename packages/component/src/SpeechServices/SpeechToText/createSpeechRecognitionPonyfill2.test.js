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
        emitRead: chunk => {
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

    async setFirstAudioChunk(chunk = []) {
      this.audioConfig.attach().onSuccessContinueWith(reader => reader.read(chunk));
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
    switch (eventName) {
      case 'error':
        speech.addEventListener(eventName, ({ error }) => queue.push(`webspeech:error { error: '${ error }' }`));

        break;

      case 'result':
        speech.addEventListener(eventName, ({ results, type }) => {
          const { length } = results;
          const [{ isFinal } = {}] = results;

          queue.push(`webspeech:${ type } { isFinal: ${ !!isFinal }, length: ${ length } }`);
        });

        break;

      default:
        speech.addEventListener(eventName, ({ type }) => queue.push(`webspeech:${ type }`));

        break;
    }
  }

  speech.addEventListener('cognitiveservices', ({ subType, type }) => queue.push(`${ type }:${ subType }`));

  return queue;
}

describe('Mock SpeechRecognizer with', () => {
  let endEventEmitted;
  let errorEventEmitted;
  let events;
  let recognizer;
  let speechRecognition;

  beforeEach(async () => {
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

  test('happy path without interims', async () => {
    speechRecognition.start();
    await recognizer.waitForRecognizeOnceAsync();

    // This will fire "firstAudioChunk" on "emitRead"
    recognizer.setFirstAudioChunk();

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

    expect(events).toMatchSnapshot();
  });

  test('happy path with 2 interims', async () => {
    speechRecognition.start();
    speechRecognition.interimResults = true;
    await recognizer.waitForRecognizeOnceAsync();

    // This will fire "firstAudioChunk" on "emitRead"
    recognizer.setFirstAudioChunk();

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

    expect(events).toMatchSnapshot();
  });

  test('muted microphone', async () => {
    speechRecognition.start();
    await recognizer.waitForRecognizeOnceAsync();

    // This will fire "firstAudioChunk" on "emitRead"
    recognizer.setFirstAudioChunk();

    recognizer.audioConfig.emitEvent('AudioSourceReadyEvent');
    recognizer.audioConfig.emitRead();

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

    expect(events).toMatchSnapshot();
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

    expect(events).toMatchSnapshot();
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

    expect(events).toMatchSnapshot();
  });

  test('abort with partial recognized text', async () => {
    speechRecognition.start();
    await recognizer.waitForRecognizeOnceAsync();

    // This will fire "firstAudioChunk" on "emitRead"
    recognizer.setFirstAudioChunk();

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

    recognizer.audioConfig.emitEvent('AudioSourceOffEvent');

    // cognitiveservices:audioSourceOff
    // webspeech:speechend
    // webspeech:soundend
    // webspeech:audioend

    recognizer.rejectRecognizeOnceAsync('aborted');

    // webspeech:error
    // webspeech:end

    await errorEventEmitted;

    expect(events).toMatchSnapshot();
  });
});
