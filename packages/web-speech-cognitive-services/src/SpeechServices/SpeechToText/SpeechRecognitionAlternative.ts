export type SpeechRecognitionAlternativeInit = {
  confidence: number;
  transcript: string;
};

export default class SpeechRecognitionAlternative {
  constructor({ confidence, transcript }: SpeechRecognitionAlternativeInit) {
    this.#confidence = confidence;
    this.#transcript = transcript;
  }

  #confidence: number;
  #transcript: string;

  get confidence() {
    return this.#confidence;
  }

  get transcript() {
    return this.#transcript;
  }
}
