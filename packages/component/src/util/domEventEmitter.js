import EventEmitter from 'events';

export default class DOMEventEmitter {
  constructor() {
    this._events = new EventEmitter();
  }

  addEventListener(name, listener) {
    this._events.addListener(name, listener);
  }

  removeEventListener(name, listener) {
    name ? this._events.removeListener(name, listener) : this._events.removeAllListeners(name);
  }

  emit(name, event = { type: name }) {
    const legacy = this[`on${ name }`];

    legacy && legacy.call(this, event);
    this._events.emit(name, event);
  }
}
