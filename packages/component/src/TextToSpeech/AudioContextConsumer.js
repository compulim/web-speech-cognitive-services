export default class {
  async start(queue, { AudioContext }) {
    if (this.audioContext) {
      throw new Error('already started');
    }

    let utterance;

    try {
      while ((utterance = queue.shift())) {
        this.playingUtterance = utterance;

        await utterance.play(this.audioContext || (this.audioContext = new AudioContext()));

        this.playingUtterance = null;
      }
    } finally {
      await this.audioContext && this.audioContext.close();
    }
  }

  stop() {
    this.playingUtterance && this.playingUtterance.stop();
  }
}
