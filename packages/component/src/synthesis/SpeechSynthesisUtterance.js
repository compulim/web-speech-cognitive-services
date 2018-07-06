import EventAsPromise from 'event-as-promise';
import fetchSpeechData from './fetchSpeechData';
import subscribeEvent from './subscribeEvent';

function asyncDecodeAudioData(audioContext, arrayBuffer) {
  return new Promise((resolve, reject) => {
    const promise = audioContext.decodeAudioData(arrayBuffer, resolve, reject);

    // Newer implementation of "decodeAudioData" will return a Promise
    typeof promise.then === 'function' && resolve(promise);
  });
}

function playDecoded(audioContext, audioBuffer, volume) {
  return new Promise(async (resolve, reject) => {
    const audioContextClosed = new EventAsPromise();
    const unsubscribe = subscribeEvent(audioContext, 'statechange', ({ target: { state } }) => state === 'closed' && audioContextClosed.eventListener());

    try {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();

      source.buffer = audioBuffer;
      // "ended" may not fire if the underlying AudioContext is closed prematurely
      source.onended = resolve;

      gainNode.gain.setValueAtTime(volume, 0);

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.start(0);

      await audioContextClosed.upcoming();

      resolve();
    } catch (err) {
      reject(err);
    } finally {
      unsubscribe();
    }
  });
}

export default class {
  constructor(text) {
    this._lang = null;
    this._pitch = 1;
    this._rate = 1;
    this._voice = null;
    this._volume = 1;

    this.text = text;

    this.onboundary = null;
    this.onend = null;
    this.onerror = null;
    this.onmark = null;
    this.onpause = null;
    this.onresume = null;
    this.onstart = null;
  }

  get lang() { return this._lang; }
  set lang(value) { this._lang = value; }

  get pitch() { return this._pitch; }
  set pitch(value) { this._pitch = value; }

  get rate() { return this._rate; }
  set rate(value) { this._rate = value; }

  get voice() { return this._voice; }
  set voice(value) { this._voice = value; }

  get volume() { return this._volume; }
  set volume(value) { this._volume = value; }

  async preload() {
    this.arrayBufferPromise = fetchSpeechData({
      lang: this.lang || window.navigator.language,
      outputFormat: this.outputFormat,
      speechToken: this.speechToken,
      text: this.text,
      voice: this.voice && this.voice.voiceURI
    });

    await this.arrayBufferPromise;
  }

  async play(audioContext) {
    try {
      const audioBuffer = await asyncDecodeAudioData(audioContext, await this.arrayBufferPromise);

      this.onstart && this.onstart({ type: 'start' });

      await playDecoded(audioContext, audioBuffer, this.volume);

      this.onend && this.onend({ type: 'end' });
    } catch (error) {
      this.onerror && this.onerror({ error, type: 'error' });
      throw error;
    }
  }
}
