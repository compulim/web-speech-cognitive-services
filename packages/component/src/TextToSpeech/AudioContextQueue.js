import AudioContextConsumer from './AudioContextConsumer';

export default class {
  constructor(ponyfill) {
    this.consumer = null;
    this.ponyfill = ponyfill;
    this.queue = [];
  }

  async startConsumer() {
    while (this.queue.length && !this.consumer) {
      this.consumer = new AudioContextConsumer();
      await this.consumer.start(this.queue, this.ponyfill);
      this.consumer = null;
    }
  }

  push(utterance) {
    this.queue.push(utterance);
    this.startConsumer();
  }

  stop() {
    this.queue.splice(0);
    this.consumer && this.consumer.stop();
  }
}
