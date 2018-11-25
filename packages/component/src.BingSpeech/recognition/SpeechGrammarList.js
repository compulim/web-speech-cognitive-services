import updateIn from 'simple-update-in';

export default class {
  constructor() {
    this._referenceGrammar = null;
    this._words = [];
  }

  addFromString() {
    throw new Error('JSGF is not supported');
  }

  get referenceGrammar() { return this._referenceGrammar; }
  set referenceGrammar(nextReferenceGrammar) {
    if (typeof nextReferenceGrammar !== 'string') {
      throw new Error('referenceGrammar must be a string');
    }

    this._referenceGrammar = nextReferenceGrammar;
  }

  get words() { return this._words; }
  set words(nextWords) {
    if (!Array.isArray(nextWords)) {
      throw new Error('words must be an Array');
    }

    this._words = nextWords;
  }

  createSpeechContext() {
    const { referenceGrammar, words } = this;
    let speechContext;

    if (referenceGrammar) {
      speechContext = updateIn(speechContext, ['dgi', 'Groups'], (groups = []) => [...groups, {
        Type: 'Generic',
        Hints: { ReferenceGrammar: referenceGrammar }
      }]);
    }

    if (words && words.length) {
      speechContext = updateIn(speechContext, ['dgi', 'Groups'], (groups = []) => [...groups, {
        Type: 'Generic',
        Items: words.map(word => ({ Text: word }))
      }]);
    }

    return speechContext;
  }
}
