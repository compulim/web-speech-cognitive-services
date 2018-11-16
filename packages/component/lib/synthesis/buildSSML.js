"use strict";

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
      pitch = _ref$pitch === void 0 ? 1 : _ref$pitch,
      _ref$rate = _ref.rate,
      rate = _ref$rate === void 0 ? 1 : _ref$rate,
      text = _ref.text,
      voice = _ref.voice,
      volume = _ref.volume;
  return "<speak version=\"1.0\" xml:lang=\"".concat(lang, "\">\n  <voice") + (lang ? " xml:lang=\"".concat(lang, "\"") : '') + (gender ? " xml:gender=\"".concat(gender, "\"") : '') + (voice ? " name=\"".concat(voice, "\"") : '') + ">\n    <prosody pitch=\"".concat(relativePercentage(pitch), "\" rate=\"").concat(relativePercentage(rate), "\" volume=\"").concat(relativePercentage(volume), "\">\n      ").concat(text, "\n    </prosody>\n  </voice>\n</speak>");
}
//# sourceMappingURL=buildSSML.js.map