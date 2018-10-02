'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _buildSSML = require('./buildSSML');

var _buildSSML2 = _interopRequireDefault(_buildSSML);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_LANGUAGE = 'en-US';
var DEFAULT_VOICE = 'Microsoft Server Speech Text to Speech Voice (en-US, JessaRUS)';
var SYNTHESIS_URL = 'https://speech.platform.bing.com/synthesize';

exports.default = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref) {
    var accessToken = _ref.accessToken,
        _ref$lang = _ref.lang,
        lang = _ref$lang === undefined ? DEFAULT_LANGUAGE : _ref$lang,
        outputFormat = _ref.outputFormat,
        pitch = _ref.pitch,
        rate = _ref.rate,
        text = _ref.text,
        _ref$voice = _ref.voice,
        voice = _ref$voice === undefined ? DEFAULT_VOICE : _ref$voice,
        volume = _ref.volume;
    var ssml, res;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ssml = (0, _buildSSML2.default)({ lang: lang, pitch: pitch, rate: rate, text: text, voice: voice, volume: volume });
            _context.next = 3;
            return fetch(SYNTHESIS_URL, {
              headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': outputFormat
              },
              method: 'POST',
              body: ssml
            });

          case 3:
            res = _context.sent;

            if (!(res.status !== 200)) {
              _context.next = 6;
              break;
            }

            throw new Error('Failed to synthesize speech, server returned ' + res.status);

          case 6:
            return _context.abrupt('return', res.arrayBuffer());

          case 7:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function fetchSpeechData(_x) {
    return _ref2.apply(this, arguments);
  }

  return fetchSpeechData;
}();
//# sourceMappingURL=fetchSpeechData.js.map