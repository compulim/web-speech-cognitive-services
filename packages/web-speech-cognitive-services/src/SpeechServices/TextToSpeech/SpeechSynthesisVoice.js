export default class SpeechSynthesisVoice {
  constructor({ gender, lang, voiceURI }) {
    this._default = false;
    this._gender = gender;
    this._lang = lang;
    this._localService = false;
    this._name = voiceURI;
    this._voiceURI = voiceURI;
  }

  get default() {
    return this._default;
  }

  get gender() {
    return this._gender;
  }

  get lang() {
    return this._lang;
  }

  get localService() {
    return this._localService;
  }

  get name() {
    return this._name;
  }

  get voiceURI() {
    return this._voiceURI;
  }
}
