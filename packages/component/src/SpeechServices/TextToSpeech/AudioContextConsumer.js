export default class {
  pause() {
    this.audioContext && this.audioContext.suspend();
    this.playingUtterance && this.playingUtterance.emit('pause');
  }

  resume() {
    this.audioContext && this.audioContext.resume();
    this.playingUtterance && this.playingUtterance.emit('resume');
  }

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

    if (this.audioContext) {
      // Play -> Pause -> Cancel (stop)
      // This would generate these events: "start", "pause", "end"

      // Without this code, the "end" event will not emit until resume() is called
      // Cancelling an unstarted utterance will not emit any "start" or "end" event
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
