import { select, takeEvery } from 'redux-saga/effects';

import { CANCEL_SPEECH_SYNTHESIS } from '../actions/cancelSpeechSynthesis.ts';
import { PAUSE_SPEECH_SYNTHESIS } from '../actions/pauseSpeechSynthesis.ts';
import { RESUME_SPEECH_SYNTHESIS } from '../actions/resumeSpeechSynthesis.ts';

export default function* speechSynthesisCancelPauseResumeSaga() {
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
