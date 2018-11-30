import AudioContextConsumer from './AudioContextConsumer';

export default class {
  constructor(ponyfill) {
    this.consumer = null;
    this.paused = false;
    this.ponyfill = ponyfill;
    this.queue = [];
  }

  async startConsumer() {
    while (!this.paused && this.queue.length && !this.consumer) {
      this.consumer = new AudioContextConsumer();
      await this.consumer.start(this.queue, this.ponyfill);
      this.consumer = null;
    }
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

  stop() {
    this.queue.splice(0);
    this.consumer && this.consumer.stop();
  }
}
