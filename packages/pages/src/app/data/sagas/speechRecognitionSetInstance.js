import { call, fork, put, takeLatest } from 'redux-saga/effects';

import addSpeechRecognitionEvent from '../actions/addSpeechRecognitionEvent.ts';
import { SET_SPEECH_RECOGNITION_INSTANCE } from '../actions/setSpeechRecognitionInstance.ts';

import createPromiseQueue from '../utils/createPromiseQueue.js';
import forever from './effects/forever.js';

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

export default function* speechRecognitionSetInstanceSaga() {
  const events = createPromiseQueue();

  yield fork(function* () {
    for (;;) {
      const event = yield call(events.shift);

      yield put(addSpeechRecognitionEvent(event));
    }
  });

  yield takeLatest(SET_SPEECH_RECOGNITION_INSTANCE, function* ({ payload: { speechRecognition } }) {
    try {
      MONITORING_EVENTS.forEach(name => speechRecognition.addEventListener(name, events.push));

      yield forever();
    } finally {
      MONITORING_EVENTS.forEach(name => speechRecognition.removeEventListener(name, events.push));
    }
  });
}
