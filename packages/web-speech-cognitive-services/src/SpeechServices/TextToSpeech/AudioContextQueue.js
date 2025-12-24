/* eslint no-await-in-loop: "off" */

import memoize from 'memoize-one';

import AudioContextConsumer from './AudioContextConsumer.js';

export default class AudioContextQueue {
  constructor({ audioContext, ponyfill }) {
    this.consumer = null;
    this.paused = false;
    this.queue = [];

    this.getAudioContext = memoize(() => audioContext || new ponyfill.AudioContext());
  }

  pause() {
    this.paused = true;
    this.consumer && this.consumer.pause();
  }

  push(utterance) {
    this.queue.push(utterance);
    this.startConsumer();
  }

  resume() {
    this.paused = false;

    if (this.consumer) {
      this.consumer.resume();
    } else {
      this.startConsumer();
    }
  }

  get speaking() {
    return !!this.consumer;
  }

  async startConsumer() {
    while (!this.paused && this.queue.length && !this.consumer) {
      this.consumer = new AudioContextConsumer(this.getAudioContext());

      await this.consumer.start(this.queue);

      this.consumer = null;
    }
  }

  stop() {
    this.queue.splice(0);
    this.consumer && this.consumer.stop();
  }
}
