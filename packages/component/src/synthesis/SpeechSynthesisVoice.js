export default class {
  constructor({ lang, name, voiceURI }) {
    this._lang = lang;
    this._name = name;
    this._voiceURI = voiceURI;
  }

  get default() { return false; }
  get lang() { return this._lang; }
  get localService() { return false; }
  get name() { return this._name; }
  get voiceURI() { return this._voiceURI; }
}
