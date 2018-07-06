export default class AudioContextConsumer {
  async start(queue, audioContextClass = window.AudioContext || window.webkitAudioContext) {
    if (this.audioContext) {
      throw new Error('already started');
    }

    let utterance;

    try {
      while ((utterance = queue.shift())) {
        await utterance.play(this.audioContext || (this.audioContext = new audioContextClass()));
      }
    } finally {
      await this.audioContext && this.audioContext.close();
    }
  }

  stop() {
    if (this.audioContext) {
      const closePromise = this.audioContext.close();

      this.audioContext = null;

      return closePromise;
    }
  }
}
