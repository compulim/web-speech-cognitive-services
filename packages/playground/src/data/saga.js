import { fork } from 'redux-saga/effects';

import convertSubscriptionKeyToAuthorizationToken from './sagas/convertSubscriptionKeyToAuthorizationToken';
import setPonyfill from './sagas/setPonyfill';
import speechRecognitionSetInstance from './sagas/speechRecognitionSetInstance';
import speechRecognitionStart from './sagas/speechRecognitionStart';
import speechSynthesisCancelPauseResume from './sagas/speechSynthesisCancelPauseResume';
import speechSynthesisSetNativeVoices from './sagas/speechSynthesisSetNativeVoices';
import speechSynthesisSpeakUtterance from './sagas/speechSynthesisSpeakUtterance';
import speechSynthesisUtteranceEvent from './sagas/speechSynthesisUtteranceEvent';

export default function* () {
  yield fork(convertSubscriptionKeyToAuthorizationToken);
  yield fork(setPonyfill);
  yield fork(speechRecognitionSetInstance);
  yield fork(speechRecognitionStart);
  yield fork(speechSynthesisCancelPauseResume);
  yield fork(speechSynthesisSetNativeVoices);
  yield fork(speechSynthesisSpeakUtterance);
  yield fork(speechSynthesisUtteranceEvent);
}
