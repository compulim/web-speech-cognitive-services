import { fork } from 'redux-saga/effects';

import setPonyfill from './sagas/setPonyfill';
import speechRecognitionSetInstance from './sagas/speechRecognitionSetInstance';
import speechRecognitionStart from './sagas/speechRecognitionStart';
import speechSynthesisCancel from './sagas/speechSynthesisCancel';
import speechSynthesisSetNativeVoices from './sagas/speechSynthesisSetNativeVoices';
import speechSynthesisSpeakUtterance from './sagas/speechSynthesisSpeakUtterance';
import speechSynthesisUtteranceEvent from './sagas/speechSynthesisUtteranceEvent';

export default function* () {
  yield fork(setPonyfill);
  yield fork(speechRecognitionSetInstance);
  yield fork(speechRecognitionStart);
  yield fork(speechSynthesisCancel);
  yield fork(speechSynthesisSetNativeVoices);
  yield fork(speechSynthesisSpeakUtterance);
  yield fork(speechSynthesisUtteranceEvent);
}
