"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _domEventEmitter = _interopRequireDefault(require("../util/domEventEmitter"));

var _eventAsPromise = _interopRequireDefault(require("event-as-promise"));

var _fetchSpeechData = _interopRequireDefault(require("./fetchSpeechData"));

var _subscribeEvent = _interopRequireDefault(require("./subscribeEvent"));

function asyncDecodeAudioData(audioContext, arrayBuffer) {
  return new Promise(function (resolve, reject) {
    var promise = audioContext.decodeAudioData(arrayBuffer, resolve, reject); // Newer implementation of "decodeAudioData" will return a Promise

    promise && typeof promise.then === 'function' && resolve(promise);
  });
}

function playDecoded(audioContext, audioBuffer, source) {
  return new Promise(
  /*#__PURE__*/
  function () {
    var _ref = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee(resolve, reject) {
      var audioContextClosed, sourceEnded, unsubscribe;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              audioContextClosed = new _eventAsPromise.default();
              sourceEnded = new _eventAsPromise.default();
              unsubscribe = (0, _subscribeEvent.default)(audioContext, 'statechange', function (_ref2) {
                var state = _ref2.target.state;
                return state === 'closed' && audioContextClosed.eventListener();
              });
              _context.prev = 3;
              source.buffer = audioBuffer; // "ended" may not fire if the underlying AudioContext is closed prematurely

              source.onended = sourceEnded.eventListener;
              source.connect(audioContext.destination);
              source.start(0);
              _context.next = 10;
              return Promise.race([audioContextClosed.upcoming(), sourceEnded.upcoming()]);

            case 10:
              resolve();
              _context.next = 16;
              break;

            case 13:
              _context.prev = 13;
              _context.t0 = _context["catch"](3);
              reject(_context.t0);

            case 16:
              _context.prev = 16;
              unsubscribe();
              return _context.finish(16);

            case 19:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[3, 13, 16, 19]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
}

var _default =
/*#__PURE__*/
function (_DOMEventEmitter) {
  (0, _inherits2.default)(_default, _DOMEventEmitter);

  function _default(text) {
    var _this;

    (0, _classCallCheck2.default)(this, _default);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(_default).call(this, ['boundary', 'end', 'error', 'mark', 'pause', 'resume', 'start']));
    _this._lang = null;
    _this._pitch = 1;
    _this._rate = 1;
    _this._voice = null;
    _this._volume = 1;
    _this.text = text;
    _this.onboundary = null;
    _this.onend = null;
    _this.onerror = null;
    _this.onmark = null;
    _this.onpause = null;
    _this.onresume = null;
    _this.onstart = null;
    return _this;
  }

  (0, _createClass2.default)(_default, [{
    key: "preload",
    value: function () {
      var _preload = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2() {
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.arrayBufferPromise = (0, _fetchSpeechData.default)({
                  accessToken: this.accessToken,
                  lang: this.lang || window.navigator.language,
                  outputFormat: this.outputFormat,
                  pitch: this.pitch,
                  rate: this.rate,
                  text: this.text,
                  voice: this.voice && this.voice.voiceURI || undefined,
                  volume: this.volume,
                  region: this.region
                });
                _context2.next = 3;
                return this.arrayBufferPromise;

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function preload() {
        return _preload.apply(this, arguments);
      };
    }()
  }, {
    key: "play",
    value: function () {
      var _play = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3(audioContext) {
        var source, audioBuffer;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                // HACK: iOS requires bufferSourceNode to be constructed before decoding data
                source = audioContext.createBufferSource();
                _context3.t0 = asyncDecodeAudioData;
                _context3.t1 = audioContext;
                _context3.next = 6;
                return this.arrayBufferPromise;

              case 6:
                _context3.t2 = _context3.sent;
                _context3.next = 9;
                return (0, _context3.t0)(_context3.t1, _context3.t2);

              case 9:
                audioBuffer = _context3.sent;
                this.emit('start');
                this._playingSource = source;
                _context3.next = 14;
                return playDecoded(audioContext, audioBuffer, source);

              case 14:
                this._playingSource = null;
                this.emit('end');
                _context3.next = 22;
                break;

              case 18:
                _context3.prev = 18;
                _context3.t3 = _context3["catch"](0);
                this.emit('error', {
                  error: _context3.t3,
                  type: 'error'
                });
                throw _context3.t3;

              case 22:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 18]]);
      }));

      return function play(_x3) {
        return _play.apply(this, arguments);
      };
    }()
  }, {
    key: "stop",
    value: function stop() {
      this._playingSource && this._playingSource.stop();
    }
  }, {
    key: "lang",
    get: function get() {
      return this._lang;
    },
    set: function set(value) {
      this._lang = value;
    }
  }, {
    key: "pitch",
    get: function get() {
      return this._pitch;
    },
    set: function set(value) {
      this._pitch = value;
    }
  }, {
    key: "rate",
    get: function get() {
      return this._rate;
    },
    set: function set(value) {
      this._rate = value;
    }
  }, {
    key: "voice",
    get: function get() {
      return this._voice;
    },
    set: function set(value) {
      this._voice = value;
    }
  }, {
    key: "volume",
    get: function get() {
      return this._volume;
    },
    set: function set(value) {
      this._volume = value;
    }
  }]);
  return _default;
}(_domEventEmitter.default);

exports.default = _default;
//# sourceMappingURL=SpeechSynthesisUtterance.js.map