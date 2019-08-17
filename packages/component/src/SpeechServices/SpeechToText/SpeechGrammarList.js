/* eslint class-methods-use-this: "off" */

export default class {
  constructor() {
    this._phrases = [];
  }

  addFromString() {
    throw new Error('JSGF is not supported');
  }

  get phrases() { return this._phrases; }
  set phrases(value) {
    if (Array.isArray(value)) {
      this._phrases = value;
    } else if (typeof value === 'string') {
      this._phrases = [value];
    } else {
      throw new Error(`The provided value is not an array or of type 'string'`);
    }
  }
}
