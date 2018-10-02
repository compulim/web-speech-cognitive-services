'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function () {
  function _class() {
    (0, _classCallCheck3.default)(this, _class);
  }

  (0, _createClass3.default)(_class, [{
    key: 'start',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(queue) {
        var audioContextClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window.AudioContext || window.webkitAudioContext;
        var utterance;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.audioContext) {
                  _context.next = 2;
                  break;
                }

                throw new Error('already started');

              case 2:
                utterance = void 0;
                _context.prev = 3;

              case 4:
                if (!(utterance = queue.shift())) {
                  _context.next = 11;
                  break;
                }

                this.playingUtterance = utterance;

                _context.next = 8;
                return utterance.play(this.audioContext || (this.audioContext = new audioContextClass()));

              case 8:

                this.playingUtterance = null;
                _context.next = 4;
                break;

              case 11:
                _context.prev = 11;
                _context.next = 14;
                return this.audioContext;

              case 14:
                _context.t0 = _context.sent;

                if (!_context.t0) {
                  _context.next = 17;
                  break;
                }

                this.audioContext.close();

              case 17:
                return _context.finish(11);

              case 18:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[3,, 11, 18]]);
      }));

      function start(_x2) {
        return _ref.apply(this, arguments);
      }

      return start;
    }()
  }, {
    key: 'stop',
    value: function stop() {
      this.playingUtterance && this.playingUtterance.stop();
    }
  }]);
  return _class;
}();

exports.default = _class;
//# sourceMappingURL=AudioContextConsumer.js.map