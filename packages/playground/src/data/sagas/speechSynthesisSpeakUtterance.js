/* eslint no-magic-numbers: ["error", { "ignore": [1, 2, 36] }] */

import { put, select, takeEvery } from 'redux-saga/effects';

import { SPEECH_SYNTHESIS_SPEAK_UTTERANCE } from '../actions/speechSynthesisSpeakUtterance';
import addSpeechSynthesisNativeUtterance from '../actions/addSpeechSynthesisNativeUtterance';

export default function* speechSynthesisSpeakUtteranceSaga() {
  yield takeEvery(SPEECH_SYNTHESIS_SPEAK_UTTERANCE, function*({ payload: { utterance } }) {
    const { text, voiceURI } = utterance;

    const {
      ponyfill: { speechSynthesis, SpeechSynthesisUtterance },
      speechSynthesisNativeVoices
    } = yield select();

    const nativeUtterance = new SpeechSynthesisUtterance(text);

    nativeUtterance.id = Math.random()
      .toString(36)
      .substr(2);

    const nativeVoice = speechSynthesisNativeVoices.find(voice => voice.voiceURI === voiceURI);

    if (nativeVoice) {
      nativeUtterance.voice = nativeVoice;
    } else {
      nativeUtterance.voice = { voiceURI };
    }

    yield put(addSpeechSynthesisNativeUtterance(nativeUtterance));

    speechSynthesis.speak(nativeUtterance);
  });
}
