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

var _AudioContextConsumer = require('./AudioContextConsumer');

var _AudioContextConsumer2 = _interopRequireDefault(_AudioContextConsumer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function () {
  function _class() {
    var audioContextClass = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.AudioContext || window.webkitAudioContext;
    (0, _classCallCheck3.default)(this, _class);

    this.audioContextClass = audioContextClass;
    this.consumer = null;
    this.queue = [];
  }

  (0, _createClass3.default)(_class, [{
    key: 'startConsumer',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(this.queue.length && !this.consumer)) {
                  _context.next = 7;
                  break;
                }

                this.consumer = new _AudioContextConsumer2.default();
                _context.next = 4;
                return this.consumer.start(this.queue, this.audioContextClass);

              case 4:
                this.consumer = null;
                _context.next = 0;
                break;

              case 7:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function startConsumer() {
        return _ref.apply(this, arguments);
      }

      return startConsumer;
    }()
  }, {
    key: 'push',
    value: function push(utterance) {
      this.queue.push(utterance);
      this.startConsumer();
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.queue.splice(0);
      this.consumer && this.consumer.stop();
    }
  }]);
  return _class;
}();

exports.default = _class;
//# sourceMappingURL=AudioContextQueue.js.map