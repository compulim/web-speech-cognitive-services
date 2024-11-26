interface W3CSpeechGrammar {
  src: string;
  weight: number;
}

interface W3CSpeechGrammarList {
  readonly length: number;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
  item(index: number): W3CSpeechGrammar;
  [index: number]: W3CSpeechGrammar;
}

/* eslint class-methods-use-this: "off" */

export default class SpeechGrammarList implements W3CSpeechGrammarList {
  constructor() {
    this.#phrases = [];
  }

  addFromString() {
    throw new Error('JSGF is not supported');
  }

  addFromURI() {
    throw new Error('JSGF is not supported');
  }

  item(): W3CSpeechGrammar {
    throw new Error('JSGF is not supported');
  }

  get length(): number {
    throw new Error('JSGF is not supported');
  }

  [index: number]: { src: string; weight: number };

  #phrases: readonly string[];

  get phrases(): readonly string[] {
    return this.#phrases;
  }

  set phrases(value: readonly string[]) {
    if (Array.isArray(value)) {
      this.#phrases = Object.freeze([...value]);
    } else if (typeof value === 'string') {
      this.#phrases = Object.freeze([value]);
    } else {
      throw new Error(`The provided value is not an array or of type 'string'`);
    }
  }
}
