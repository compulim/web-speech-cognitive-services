export default class {
  constructor({ gender, lang, voiceURI }) {
    this._gender = gender;
    this._lang = lang;
    this._name = voiceURI;
    this._voiceURI = voiceURI;
  }

  get default() { return false; }
  get gender() { return this._gender; }
  get lang() { return this._lang; }
  get localService() { return false; }
  get name() { return this._name; }
  get voiceURI() { return this._voiceURI; }
}
