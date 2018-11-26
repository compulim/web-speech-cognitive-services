import { call, cancel, fork, join, put, race, select, take } from 'redux-saga/effects';
import createCognitiveServicesPonyfill from 'web-speech-cognitive-services';

import addSpeechRecognitionEvent from '../actions/addSpeechRecognitionEvent';
import clearSpeechRecognitionEvent from '../actions/clearSpeechRecognitionEvent';

import { START_SPEECH_RECOGNITION } from '../actions/startSpeechRecognition';
import stopSpeechRecognition, { STOP_SPEECH_RECOGNITION } from '../actions/stopSpeechRecognition';
import { ABORT_SPEECH_RECOGNITION } from '../actions/abortSpeechRecognition';

import createPromiseQueue from '../utils/createPromiseQueue';

const MONITORING_EVENTS = [
  'audiostart',
  'soundstart',
  'speechstart',
  'speechend',
  'soundend',
  'audioend',
  'result',
  'nomatch',
  'error',
  'start',
  'end',
  'cognitiveservices'
];

export default function* () {
  for (;;) {
    let cancelReason;

    const start = yield take(START_SPEECH_RECOGNITION);
    const task = yield fork(startSpeechRecognition, {
      continuous: start.continuous,
      getCancelReason: () => cancelReason,
      interimResults: start.interimResults
    });

    const { abort, stop } = yield race({
      abort: take(ABORT_SPEECH_RECOGNITION),
      stop: take(STOP_SPEECH_RECOGNITION),
      taskCompleted: join(task)
    });

    if (abort || stop) {
      if (abort) {
        cancelReason = 'abort';
      } else if (stop) {
        cancelReason = 'stop';
      }

      yield cancel(task);
    } else {
      yield put(stopSpeechRecognition());
    }
  }
}

function* startSpeechRecognition({ getCancelReason }) {
  let speechRecognition;

  yield put(clearSpeechRecognitionEvent());

  try {
    const {
      ponyfillType,
      region,
      speechRecognitionContinuous: continuous,
      speechRecognitionInterimResults: interimResults,
      subscriptionKey
    } = yield select();

    const { SpeechRecognition } = yield call(createPonyfill, ponyfillType, region, subscriptionKey);

    speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = continuous;
    speechRecognition.interimResults = interimResults;

    const events = createPromiseQueue();

    MONITORING_EVENTS.forEach(name => speechRecognition.addEventListener(name, events.push));

    speechRecognition.start();

    for (;;) {
      const event = yield call(events.shift);

      yield put(addSpeechRecognitionEvent(event));

      if (event.type === 'end') {
        break;
      }
    }
  } catch (err) {
    if (speechRecognition) {
      if (getCancelReason() === 'abort') {
        speechRecognition.abort();
      } else {
        speechRecognition.stop();
      }
    }
  }
}

async function createPonyfill(ponyfillType, region, subscriptionKey) {
  switch (ponyfillType) {
    case 'cognitiveservices':
      return await createCognitiveServicesPonyfill({ region, subscriptionKey });

    default:
      return {
        SpeechGrammarList: window.SpeechGrammarList || window.webkitSpeechGrammarList,
        SpeechRecognition: window.SpeechRecognition || window.webkitSpeechRecognition
      };
  }
}
