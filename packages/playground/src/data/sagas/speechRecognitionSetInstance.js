import { call, fork, put, takeLatest } from 'redux-saga/effects';

import addSpeechRecognitionEvent from '../actions/addSpeechRecognitionEvent';
import { SET_SPEECH_RECOGNITION_INSTANCE } from '../actions/setSpeechRecognitionInstance';

import createPromiseQueue from '../utils/createPromiseQueue';
import forever from './effects/forever';

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

  yield fork(function*() {
    for (;;) {
      const event = yield call(events.shift);

      yield put(addSpeechRecognitionEvent(event));
    }
  });

  yield takeLatest(SET_SPEECH_RECOGNITION_INSTANCE, function*({ payload: { speechRecognition } }) {
    try {
      MONITORING_EVENTS.forEach(name => speechRecognition.addEventListener(name, events.push));

      yield forever();
    } finally {
      MONITORING_EVENTS.forEach(name => speechRecognition.removeEventListener(name, events.push));
    }
  });
}
