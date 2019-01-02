"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetchSpeechData;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _buildSSML = _interopRequireDefault(require("./buildSSML"));

var DEFAULT_LANGUAGE = "en-US";
var DEFAULT_VOICE = "Microsoft Server Speech Text to Speech Voice (en-US, JessaRUS)";
var SYNTHESIS_URL = "tts.speech.microsoft.com/cognitiveservices/v1";
var DEFAULT_REGION = "westus";

function fetchSpeechData(_x) {
  return _fetchSpeechData.apply(this, arguments);
}

function _fetchSpeechData() {
  _fetchSpeechData = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(_ref) {
    var accessToken, _ref$lang, lang, outputFormat, pitch, rate, text, _ref$voice, voice, volume, _ref$gender, gender, _ref$region, region, ssml, res;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            accessToken = _ref.accessToken, _ref$lang = _ref.lang, lang = _ref$lang === void 0 ? DEFAULT_LANGUAGE : _ref$lang, outputFormat = _ref.outputFormat, pitch = _ref.pitch, rate = _ref.rate, text = _ref.text, _ref$voice = _ref.voice, voice = _ref$voice === void 0 ? DEFAULT_VOICE : _ref$voice, volume = _ref.volume, _ref$gender = _ref.gender, gender = _ref$gender === void 0 ? null : _ref$gender, _ref$region = _ref.region, region = _ref$region === void 0 ? DEFAULT_REGION : _ref$region;
            ssml = (0, _buildSSML.default)({
              gender: gender,
              lang: lang,
              pitch: pitch,
              rate: rate,
              text: text,
              voice: voice,
              volume: volume
            });
            _context.t0 = fetch;
            _context.t1 = "https://".concat(region, ".").concat(SYNTHESIS_URL);
            _context.next = 6;
            return accessToken;

          case 6:
            _context.t2 = _context.sent;
            _context.t3 = "Bearer " + _context.t2;
            _context.t4 = outputFormat;
            _context.t5 = {
              Authorization: _context.t3,
              "Content-Type": "application/ssml+xml",
              "X-Microsoft-OutputFormat": _context.t4
            };
            _context.t6 = ssml;
            _context.t7 = {
              headers: _context.t5,
              method: "POST",
              body: _context.t6
            };
            _context.next = 14;
            return (0, _context.t0)(_context.t1, _context.t7);

          case 14:
            res = _context.sent;

            if (!(res.status !== 200)) {
              _context.next = 17;
              break;
            }

            throw new Error("Failed to synthesize speech, server returned ".concat(res.status));

          case 17:
            return _context.abrupt("return", res.arrayBuffer());

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _fetchSpeechData.apply(this, arguments);
}
//# sourceMappingURL=fetchSpeechData.js.map