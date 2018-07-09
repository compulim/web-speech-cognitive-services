import EventEmitter from 'events';

export default class {
  constructor(events = []) {
    this._events = new EventEmitter();

    events.forEach(name => {
      this._events.addListener(name, event => {
        const handler = this[`on${ name }`];

        handler && handler.call(this, event);
      });
    });
  }

  addEventListener(name, listener) {
    this._events.addListener(name, listener);
  }

  removeEventListener(name, listener) {
    name ? this._events.removeListener(name, listener) : this._events.removeAllListeners(name);
  }

  emit(name, event = { type: name }) {
    this._events.emit(name, event);
  }
}
