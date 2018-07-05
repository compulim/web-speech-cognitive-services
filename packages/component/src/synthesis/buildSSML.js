export default function buildSSML({ lang, text, voice }) {
  return `<speak version="1.0" xml:lang="${ lang }">
  <voice xml:lang="${ lang }" xml:gender="Female" name="${ voice }">
    ${ text }
  </voice>
</speak>`;
}
