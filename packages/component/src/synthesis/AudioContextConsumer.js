import EventAsPromise from 'event-as-promise';

export default class AudioContextConsumer {
  async start(queue, audioContextClass = window.AudioContext || window.webkitAudioContext) {
    if (this.audioContext) {
      throw new Error('already started');
    }

    const closed = new EventAsPromise();
    let utterance;

    try {
      while ((utterance = queue.shift())) {
        if (!this.audioContext) {
          this.audioContext = new audioContextClass();
          this.audioContext.onstatechange = ({ target: { state } }) => {
            state === 'closed' && closed.eventListener();
          };
        }

        await Promise.race([
          utterance.play(this.audioContext),
          closed.upcoming()
        ]);
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
