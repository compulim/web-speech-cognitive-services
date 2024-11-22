export type SpeechRecognitionErrorType =
  | 'aborted'
  | 'audio-capture'
  | 'bad-grammar'
  | 'language-not-supported'
  | 'network'
  | 'no-speech'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'unknown';

export type SpeechRecognitionErrorEventInit = {
  error: SpeechRecognitionErrorType;
  message?: string | undefined;
};

export default class SpeechRecognitionErrorEvent extends Event {
  constructor(type: 'error', { error, message }: SpeechRecognitionErrorEventInit) {
    super(type);

    this.#error = error;
    this.#message = message;
  }

  #error: SpeechRecognitionErrorType;
  #message: string | undefined;

  get error(): SpeechRecognitionErrorType {
    return this.#error;
  }

  get message(): string | undefined {
    return this.#message;
  }

  override get type(): 'error' {
    return 'error';
  }
}
