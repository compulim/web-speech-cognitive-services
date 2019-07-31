export default class {
  constructor(audioContext) {
    this.audioContext = audioContext;
  }

  pause() {
    this.audioContext && this.audioContext.suspend();
    this.playingUtterance && this.playingUtterance.emit('pause');
  }

  resume() {
    this.audioContext && this.audioContext.resume();
    this.playingUtterance && this.playingUtterance.emit('resume');
  }

  async start(queue) {
    let utterance;

    while ((utterance = queue.shift())) {
      this.playingUtterance = utterance;

      await utterance.play(this.audioContext);

      this.playingUtterance = null;
    }
  }

  stop() {
    this.playingUtterance && this.playingUtterance.stop();

    if (this.audioContext.state === 'suspended') {
      // Play -> Pause -> Cancel (stop)
      // This would generate these events: "start", "pause", "end"

      // Without this code, the "end" event will not emit until resume() is called
      // Cancelling an unstarted utterance will not emit any "start" or "end" event
      this.audioContext.resume();
    }
  }
}
