import {
  put,
  select,
  takeEvery
} from 'redux-saga/effects';

import { SPEECH_SYNTHESIS_SPEAK_UTTERANCE } from '../actions/speechSynthesisSpeakUtterance';
import addSpeechSynthesisUtterance from '../actions/addSpeechSynthesisUtterance';

export default function* () {
  yield takeEvery(SPEECH_SYNTHESIS_SPEAK_UTTERANCE, function* ({ payload: { utterance } }) {
    yield put(addSpeechSynthesisUtterance(utterance));

    const {
      text,
      voiceURI
    } = utterance;

    const {
      ponyfill: {
        speechSynthesis,
        SpeechSynthesisUtterance
      },
      speechSynthesisNativeVoices
    } = yield select();

    const nativeUtterance = new SpeechSynthesisUtterance(text);
    const nativeVoice = speechSynthesisNativeVoices.find(voice => voice.voiceURI === voiceURI)

    if (nativeVoice) {
      nativeUtterance.voice = nativeVoice;
    }

    speechSynthesis.speak(nativeUtterance);
  });
}
