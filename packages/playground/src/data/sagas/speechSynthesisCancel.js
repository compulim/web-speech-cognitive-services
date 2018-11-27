import {
  select,
  takeEvery
} from 'redux-saga/effects';

import { CANCEL_SPEECH_SYNTHESIS } from '../actions/cancelSpeechSynthesis';

export default function* () {
  yield takeEvery(CANCEL_SPEECH_SYNTHESIS, function* () {
    const { ponyfill: { speechSynthesis } = {} } = yield select();

    speechSynthesis && speechSynthesis.cancel();
  });
}
