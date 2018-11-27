import {
  put,
  takeEvery
} from 'redux-saga/effects';

import { SPEECH_SYNTHESIS_SPEAK_UTTERANCE } from '../actions/speechSynthesisSpeakUtterance';
import addSpeechSynthesisUtterance from '../actions/addSpeechSynthesisUtterance';

export default function* () {
  yield takeEvery(SPEECH_SYNTHESIS_SPEAK_UTTERANCE, function* ({ payload: { utterance } }) {
    yield put(addSpeechSynthesisUtterance(utterance));
  });
}
