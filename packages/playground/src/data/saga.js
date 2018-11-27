import setSpeechRecognitionInstance from './sagas/setSpeechRecognitionInstance';
import startSpeechRecognition from './sagas/startSpeechRecognition';

export default function* () {
  yield* setSpeechRecognitionInstance();
  yield* startSpeechRecognition();
}
