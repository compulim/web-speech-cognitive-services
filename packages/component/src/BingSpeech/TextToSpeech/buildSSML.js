// Cognitive Services does not support unsigned percentage
// It must be converted into +/- first.
function relativePercentage(value) {
  let relative = Math.round((value - 1) * 100);

  if (relative >= 0) {
    relative = '+' + relative;
  }

  return relative + '%';
}

export default function buildSSML({ gender, lang, pitch = 1, rate = 1, text, voice, volume }) {
  return `<speak version="1.0" xml:lang="${ lang }">
  <voice xml:lang="${ lang }" xml:gender="${ gender }" name="${ voice }">
    <prosody pitch="${ relativePercentage(pitch) }" rate="${ relativePercentage(rate) }" volume="${ relativePercentage(volume) }">
      ${ text }
    </prosody>
  </voice>
</speak>`;
}
