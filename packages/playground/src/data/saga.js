import { fork } from 'redux-saga/effects';

import setPonyfill from './sagas/setPonyfill';
import speechRecognitionSetInstance from './sagas/speechRecognitionSetInstance';
import speechRecognitionStart from './sagas/speechRecognitionStart';
import speechSynthesisSetVoices from './sagas/speechSynthesisSetVoices';
import speechSynthesisSpeakUtterance from './sagas/speechSynthesisSpeakUtterance';

export default function* () {
  yield fork(setPonyfill);
  yield fork(speechRecognitionSetInstance);
  yield fork(speechRecognitionStart);
  yield fork(speechSynthesisSetVoices);
  yield fork(speechSynthesisSpeakUtterance);
}
