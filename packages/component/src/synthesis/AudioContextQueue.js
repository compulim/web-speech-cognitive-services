import AudioContextConsumer from './AudioContextConsumer';

export default class {
  constructor(audioContextClass = window.AudioContext || window.webkitAudioContext) {
    this.audioContextClass = audioContextClass;
    this.consumer = null;
    this.queue = [];
  }

  async startConsumer() {
    while (this.queue.length && !this.consumer) {
      this.consumer = new AudioContextConsumer();
      await this.consumer.start(this.queue, this.audioContextClass);
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
