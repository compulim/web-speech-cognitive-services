'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _AudioContextQueue = require('./AudioContextQueue');

var _AudioContextQueue2 = _interopRequireDefault(_AudioContextQueue);

var _fetchVoices = require('./fetchVoices');

var _fetchVoices2 = _interopRequireDefault(_fetchVoices);

var _SpeechSynthesisUtterance = require('./SpeechSynthesisUtterance');

var _SpeechSynthesisUtterance2 = _interopRequireDefault(_SpeechSynthesisUtterance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Supported output format can be found at https://docs.microsoft.com/en-us/azure/cognitive-services/Speech/API-Reference-REST/BingVoiceOutput#Subscription
var DEFAULT_OUTPUT_FORMAT = 'audio-16khz-128kbitrate-mono-mp3';

var SpeechSynthesis = function () {
  function SpeechSynthesis() {
    (0, _classCallCheck3.default)(this, SpeechSynthesis);

    this.onvoiceschanged = null;
    this.outputFormat = DEFAULT_OUTPUT_FORMAT;
    this.queue = new _AudioContextQueue2.default();
  }

  (0, _createClass3.default)(SpeechSynthesis, [{
    key: 'cancel',
    value: function cancel() {
      this.queue.stop();
    }
  }, {
    key: 'getVoices',
    value: function getVoices() {
      return (0, _fetchVoices2.default)();
    }
  }, {
    key: 'speak',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(utterance) {
        var _this = this;

        var accessToken;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (utterance instanceof _SpeechSynthesisUtterance2.default) {
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
                _context.next = 10;
                return this.fetchToken();

              case 10:
                accessToken = _context.sent;
                return _context.abrupt('return', new _promise2.default(function (resolve, reject) {
                  utterance.addEventListener('end', resolve);
                  utterance.addEventListener('error', reject);
                  utterance.accessToken = accessToken;
                  utterance.outputFormat = _this.outputFormat;
                  utterance.preload();

                  _this.queue.push(utterance);
                }));

              case 12:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function speak(_x) {
        return _ref.apply(this, arguments);
      }

      return speak;
    }()
  }]);
  return SpeechSynthesis;
}();

exports.default = new SpeechSynthesis();
//# sourceMappingURL=speechSynthesis.js.map