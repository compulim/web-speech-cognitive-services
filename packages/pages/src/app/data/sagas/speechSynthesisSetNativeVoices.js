import { call, put, takeEvery } from 'redux-saga/effects';

import { SET_PONYFILL } from '../actions/setPonyfill.ts';
import setSpeechSynthesisNativeVoices from '../actions/setSpeechSynthesisNativeVoices.ts';

import createPromiseQueue from '../utils/createPromiseQueue.js';

export default function* speechSynthesisSetNativeVoicesSaga() {
  yield takeEvery(SET_PONYFILL, function* ({ payload: { ponyfill: { speechSynthesis } = {} } }) {
    if (!speechSynthesis) {
      return;
    }

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
