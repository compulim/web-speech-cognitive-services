import {
  call,
  put,
  takeEvery
} from 'redux-saga/effects';

import { SET_PONYFILL } from '../actions/setPonyfill';
import setSpeechSynthesisVoices from '../actions/setSpeechSynthesisVoices';

import createPromiseQueue from '../utils/createPromiseQueue';

function serializeVoices(voices) {
  return [].map.call(voices, ({ name, voiceURI }) => ({ name, voiceURI }));
}

export default function* () {
  yield takeEvery(SET_PONYFILL, function* ({ payload: { ponyfill: { speechSynthesis } = {} } }) {
    if (!speechSynthesis) { return; }

    const events = createPromiseQueue();

    try {
      speechSynthesis && speechSynthesis.addEventListener('voiceschanged', events.push);
      events.push();

      for (;;) {
        yield call(events.shift);

        const voices = serializeVoices(speechSynthesis.getVoices());

        yield put(setSpeechSynthesisVoices(voices));
      }
    } finally {
      speechSynthesis && speechSynthesis.removeEventListener('voiceschanged', events.push);
    }
  });
}
