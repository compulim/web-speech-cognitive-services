import FakeArray from './FakeArray';

export type SpeechRecognitionResultInit = {
  isFinal: boolean;
  results: readonly SpeechRecognitionAlternative[];
};

export default class SpeechRecognitionResult extends FakeArray<SpeechRecognitionAlternative> {
  constructor(init: SpeechRecognitionResultInit) {
    super(init.results);

    this.#isFinal = init.isFinal;
  }

  #isFinal: boolean;

  get isFinal(): boolean {
    return this.#isFinal;
  }
}
