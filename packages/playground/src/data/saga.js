import { fork } from 'redux-saga/effects';

import setPonyfill from './sagas/setPonyfill';
import setSpeechRecognitionInstance from './sagas/setSpeechRecognitionInstance';
import setSpeechSynthesisVoices from './sagas/setSpeechSynthesisVoices';
import speakUtterance from './sagas/speakUtterance';
import startSpeechRecognition from './sagas/startSpeechRecognition';

export default function* () {
  yield fork(setPonyfill);
  yield fork(setSpeechRecognitionInstance);
  yield fork(setSpeechSynthesisVoices);
  yield fork(speakUtterance);
  yield fork(startSpeechRecognition);
}
