import startSpeechRecognition from './sagas/startSpeechRecognition';

export default function* () {
  yield* startSpeechRecognition();
}
