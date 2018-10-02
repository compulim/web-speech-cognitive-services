'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildSSML;
// Cognitive Services does not support unsigned percentage
// It must be converted into +/- first.
function relativePercentage(value) {
  var relative = Math.round((value - 1) * 100);

  if (relative >= 0) {
    relative = '+' + relative;
  }

  return relative + '%';
}

function buildSSML(_ref) {
  var gender = _ref.gender,
      lang = _ref.lang,
      _ref$pitch = _ref.pitch,
      pitch = _ref$pitch === undefined ? 1 : _ref$pitch,
      _ref$rate = _ref.rate,
      rate = _ref$rate === undefined ? 1 : _ref$rate,
      text = _ref.text,
      voice = _ref.voice,
      volume = _ref.volume;

  return '<speak version="1.0" xml:lang="' + lang + '">\n  <voice xml:lang="' + lang + '" xml:gender="' + gender + '" name="' + voice + '">\n    <prosody pitch="' + relativePercentage(pitch) + '" rate="' + relativePercentage(rate) + '" volume="' + relativePercentage(volume) + '">\n      ' + text + '\n    </prosody>\n  </voice>\n</speak>';
}
//# sourceMappingURL=buildSSML.js.map