"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _AudioContextQueue = _interopRequireDefault(require("./AudioContextQueue"));

var _fetchVoices = _interopRequireDefault(require("./fetchVoices"));

var _SpeechSynthesisUtterance = _interopRequireDefault(require("./SpeechSynthesisUtterance"));

var DEFAULT_REGION = 'westus'; // Supported output format can be found at https://docs.microsoft.com/en-us/azure/cognitive-services/Speech/API-Reference-REST/BingVoiceOutput#Subscription

var DEFAULT_OUTPUT_FORMAT = 'audio-16khz-128kbitrate-mono-mp3';

var SpeechSynthesis =
/*#__PURE__*/
function () {
  function SpeechSynthesis() {
    (0, _classCallCheck2.default)(this, SpeechSynthesis);
    this.onvoiceschanged = null;
    this.region = DEFAULT_REGION;
    this.outputFormat = DEFAULT_OUTPUT_FORMAT;
    this.queue = new _AudioContextQueue.default();
    this._isAboutToSpeak = false;
  }

  (0, _createClass2.default)(SpeechSynthesis, [{
    key: "cancel",
    value: function cancel() {
      this._isAboutToSpeak = false;
      this.queue.stop();
    }
  }, {
    key: "getVoices",
    value: function getVoices() {
      return (0, _fetchVoices.default)();
    }
  }, {
    key: "speak",
    value: function () {
      var _speak = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(utterance) {
        var _this = this;

        var accessToken;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (utterance instanceof _SpeechSynthesisUtterance.default) {
                  _context.next = 2;
                  break;
                }

                throw new Error('invalid utterance');

              case 2:
                if (this.fetchToken) {
                  _context.next = 6;
                  break;
                }

                throw new Error('SpeechSynthesis: fetchToken must be set');

              case 6:
                if (!(typeof this.fetchToken !== 'function')) {
                  _context.next = 8;
                  break;
                }

                throw new Error('SpeechSynthesis: fetchToken must be a function that returns a Promise and it will resolve to a string-based token');

              case 8:
                this._isAboutToSpeak = true;
                _context.next = 11;
                return this.fetchToken();

              case 11:
                accessToken = _context.sent;
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  if (_this._isAboutToSpeak) {
                    utterance.addEventListener('end', resolve);
                    utterance.addEventListener('error', reject);
                    utterance.accessToken = accessToken;
                    utterance.region = _this.region;
                    utterance.outputFormat = _this.outputFormat;
                    utterance.preload();
                  }

                  if (_this._isAboutToSpeak) {
                    _this._isAboutToSpeak = false;

                    _this.queue.push(utterance);
                  }
                }));

              case 13:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function speak(_x) {
        return _speak.apply(this, arguments);
      };
    }()
  }]);
  return SpeechSynthesis;
}();

var _default = new SpeechSynthesis();

exports.default = _default;
//# sourceMappingURL=speechSynthesis.js.map