import {
  select,
  takeEvery
} from 'redux-saga/effects';

import { CANCEL_SPEECH_SYNTHESIS } from '../actions/cancelSpeechSynthesis';
import { PAUSE_SPEECH_SYNTHESIS } from '../actions/pauseSpeechSynthesis';
import { RESUME_SPEECH_SYNTHESIS } from '../actions/resumeSpeechSynthesis';

export default function* () {
  yield takeEvery(CANCEL_SPEECH_SYNTHESIS, function* () {
    const { ponyfill: { speechSynthesis } = {} } = yield select();

    speechSynthesis && speechSynthesis.cancel();
  });

  yield takeEvery(PAUSE_SPEECH_SYNTHESIS, function* () {
    const { ponyfill: { speechSynthesis } = {} } = yield select();

    speechSynthesis && speechSynthesis.pause();
  });

  yield takeEvery(RESUME_SPEECH_SYNTHESIS, function* () {
    const { ponyfill: { speechSynthesis } = {} } = yield select();

    speechSynthesis && speechSynthesis.resume();
  });
}
