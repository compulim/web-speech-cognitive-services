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

var _AudioContextConsumer = _interopRequireDefault(require("./AudioContextConsumer"));

var _default =
/*#__PURE__*/
function () {
  function _default() {
    var audioContextClass = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.AudioContext || window.webkitAudioContext;
    (0, _classCallCheck2.default)(this, _default);
    this.audioContextClass = audioContextClass;
    this.consumer = null;
    this.queue = [];
  }

  (0, _createClass2.default)(_default, [{
    key: "startConsumer",
    value: function () {
      var _startConsumer = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee() {
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(this.queue.length && !this.consumer)) {
                  _context.next = 7;
                  break;
                }

                this.consumer = new _AudioContextConsumer.default();
                _context.next = 4;
                return this.consumer.start(this.queue, this.audioContextClass);

              case 4:
                this.consumer = null;
                _context.next = 0;
                break;

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function startConsumer() {
        return _startConsumer.apply(this, arguments);
      };
    }()
  }, {
    key: "push",
    value: function push(utterance) {
      this.queue.push(utterance);
      this.startConsumer();
    }
  }, {
    key: "stop",
    value: function stop() {
      this.queue.splice(0);
      this.consumer && this.consumer.stop();
    }
  }]);
  return _default;
}();

exports.default = _default;
//# sourceMappingURL=AudioContextQueue.js.map