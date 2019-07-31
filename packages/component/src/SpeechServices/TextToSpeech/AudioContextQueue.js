import AudioContextConsumer from './AudioContextConsumer';

export default class {
  constructor({ audioContext, ponyfill }) {
    this.audioContext = audioContext || new ponyfill.AudioContext();
    this.consumer = null;
    this.paused = false;
    this.queue = [];
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
    const { audioContext } = this;

    while (!this.paused && this.queue.length && !this.consumer) {
      this.consumer = new AudioContextConsumer(audioContext);

      await this.consumer.start(this.queue);

      this.consumer = null;
    }
  }

  stop() {
    this.queue.splice(0);
    this.consumer && this.consumer.stop();
  }
}
