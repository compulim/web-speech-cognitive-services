import {
  call,
  put,
  race,
  take,
  takeEvery
} from 'redux-saga/effects';

import addSpeechSynthesisNativeUtteranceEvent from '../actions/addSpeechSynthesisNativeUtteranceEvent';
import { ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE } from '../actions/addSpeechSynthesisNativeUtterance';
import { CLEAR_SPEECH_SYNTHESIS_UTTERANCE } from '../actions/clearSpeechSynthesisUtterance';

import createPromiseQueue from '../utils/createPromiseQueue';

const MONITORING_EVENTS = [
  'boundary',
  'end',
  'error',
  'mark',
  'pause',
  'resume',
  'start'
];

export default function* () {
  yield takeEvery(ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE, function* ({ payload: { nativeUtterance } }) {
    const events = createPromiseQueue();

    try {
      MONITORING_EVENTS.forEach(name => nativeUtterance.addEventListener(name, events.push));

      for (;;) {
        const { clear, event } = yield race({
          clear: take(CLEAR_SPEECH_SYNTHESIS_UTTERANCE),
          event: call(events.shift)
        });

        if (clear) {
          break;
        } else if (event) {
          yield put(addSpeechSynthesisNativeUtteranceEvent(nativeUtterance.id, event));

          if (
            event.type === 'end'
            || event.type === 'error'
          ) {
            break;
          }
        }
      }
    } finally {
      MONITORING_EVENTS.forEach(name => nativeUtterance.removeEventListener(name, events.push));
    }
  });
}
