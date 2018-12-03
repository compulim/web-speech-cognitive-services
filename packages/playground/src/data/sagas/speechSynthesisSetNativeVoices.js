import {
  call,
  put,
  takeEvery
} from 'redux-saga/effects';

import { SET_PONYFILL } from '../actions/setPonyfill';
import setSpeechSynthesisNativeVoices from '../actions/setSpeechSynthesisNativeVoices';

import createPromiseQueue from '../utils/createPromiseQueue';

export default function* () {
  yield takeEvery(SET_PONYFILL, function* ({ payload: { ponyfill: { speechSynthesis } = {} } }) {
    if (!speechSynthesis) { return; }

    const events = createPromiseQueue();

    try {
      speechSynthesis && speechSynthesis.addEventListener('voiceschanged', events.push);
      events.push();

      for (;;) {
        yield call(events.shift);
        yield put(setSpeechSynthesisNativeVoices(speechSynthesis.getVoices()));
      }
    } finally {
      speechSynthesis && speechSynthesis.removeEventListener('voiceschanged', events.push);
    }
  });
}
