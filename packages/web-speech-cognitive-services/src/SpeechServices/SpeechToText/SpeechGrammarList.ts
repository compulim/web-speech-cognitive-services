/* eslint class-methods-use-this: "off" */

export default class SpeechGrammarList {
  constructor() {
    this.#phrases = [];
  }

  addFromString() {
    throw new Error('JSGF is not supported');
  }

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
