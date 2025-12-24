import { fork } from 'redux-saga/effects';

import convertSubscriptionKeyToAuthorizationToken from './sagas/convertSubscriptionKeyToAuthorizationToken.js';
import setPonyfill from './sagas/setPonyfill.js';
import speechRecognitionSetInstance from './sagas/speechRecognitionSetInstance.js';
import speechRecognitionStart from './sagas/speechRecognitionStart.js';
import speechSynthesisCancelPauseResume from './sagas/speechSynthesisCancelPauseResume.js';
import speechSynthesisSetNativeVoices from './sagas/speechSynthesisSetNativeVoices.js';
import speechSynthesisSpeakUtterance from './sagas/speechSynthesisSpeakUtterance.js';
import speechSynthesisUtteranceEvent from './sagas/speechSynthesisUtteranceEvent.js';

export default function* saga() {
  yield fork(convertSubscriptionKeyToAuthorizationToken);
  yield fork(setPonyfill);
  yield fork(speechRecognitionSetInstance);
  yield fork(speechRecognitionStart);
  yield fork(speechSynthesisCancelPauseResume);
  yield fork(speechSynthesisSetNativeVoices);
  yield fork(speechSynthesisSpeakUtterance);
  yield fork(speechSynthesisUtteranceEvent);
}
