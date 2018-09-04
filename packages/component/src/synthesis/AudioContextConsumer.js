export default class {
  async start(queue, audioContextClass = window.AudioContext || window.webkitAudioContext) {
    if (this.audioContext) {
      throw new Error('already started');
    }

    let utterance;

    try {
      while ((utterance = queue.shift())) {
        this.playingUtterance = utterance;

        await utterance.play(this.audioContext || (this.audioContext = new audioContextClass()));

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
