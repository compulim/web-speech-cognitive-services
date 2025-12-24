import FakeArray from './private/FakeArray.ts';
import type SpeechRecognitionResult from './SpeechRecognitionResult';

export default class SpeechRecognitionResultList extends FakeArray<SpeechRecognitionResult> {
  constructor(result: readonly SpeechRecognitionResult[]) {
    super(result);
  }
}
