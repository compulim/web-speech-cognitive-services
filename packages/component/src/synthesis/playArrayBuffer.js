export default function (audioContext, arrayBuffer) {
  return new Promise((resolve, reject) => {
    audioContext.decodeAudioData(arrayBuffer, buffer => {
      const source = audioContext.createBufferSource();

      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
      source.onended = resolve;
    }, reject);
  });
}
