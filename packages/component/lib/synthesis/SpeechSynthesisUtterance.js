'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _domEventEmitter = require('../util/domEventEmitter');

var _domEventEmitter2 = _interopRequireDefault(_domEventEmitter);

var _eventAsPromise = require('event-as-promise');

var _eventAsPromise2 = _interopRequireDefault(_eventAsPromise);

var _fetchSpeechData = require('./fetchSpeechData');

var _fetchSpeechData2 = _interopRequireDefault(_fetchSpeechData);

var _subscribeEvent = require('./subscribeEvent');

var _subscribeEvent2 = _interopRequireDefault(_subscribeEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncDecodeAudioData(audioContext, arrayBuffer) {
  return new _promise2.default(function (resolve, reject) {
    var promise = audioContext.decodeAudioData(arrayBuffer, resolve, reject);

    // Newer implementation of "decodeAudioData" will return a Promise
    promise && typeof promise.then === 'function' && resolve(promise);
  });
}

function playDecoded(audioContext, audioBuffer, source) {
  var _this = this;

  return new _promise2.default(function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(resolve, reject) {
      var audioContextClosed, sourceEnded, unsubscribe;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              audioContextClosed = new _eventAsPromise2.default();
              sourceEnded = new _eventAsPromise2.default();
              unsubscribe = (0, _subscribeEvent2.default)(audioContext, 'statechange', function (_ref2) {
                var state = _ref2.target.state;
                return state === 'closed' && audioContextClosed.eventListener();
              });
              _context.prev = 3;

              source.buffer = audioBuffer;
              // "ended" may not fire if the underlying AudioContext is closed prematurely
              source.onended = sourceEnded.eventListener;

              source.connect(audioContext.destination);
              source.start(0);

              _context.next = 10;
              return _promise2.default.race([audioContextClosed.upcoming(), sourceEnded.upcoming()]);

            case 10:

              resolve();
              _context.next = 16;
              break;

            case 13:
              _context.prev = 13;
              _context.t0 = _context['catch'](3);

              reject(_context.t0);

            case 16:
              _context.prev = 16;

              unsubscribe();
              return _context.finish(16);

            case 19:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this, [[3, 13, 16, 19]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
}

var _class = function (_DOMEventEmitter) {
  (0, _inherits3.default)(_class, _DOMEventEmitter);

  function _class(text) {
    (0, _classCallCheck3.default)(this, _class);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (_class.__proto__ || (0, _getPrototypeOf2.default)(_class)).call(this, ['boundary', 'end', 'error', 'mark', 'pause', 'resume', 'start']));

    _this2._lang = null;
    _this2._pitch = 1;
    _this2._rate = 1;
    _this2._voice = null;
    _this2._volume = 1;

    _this2.text = text;

    _this2.onboundary = null;
    _this2.onend = null;
    _this2.onerror = null;
    _this2.onmark = null;
    _this2.onpause = null;
    _this2.onresume = null;
    _this2.onstart = null;
    return _this2;
  }

  (0, _createClass3.default)(_class, [{
    key: 'preload',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.arrayBufferPromise = (0, _fetchSpeechData2.default)({
                  accessToken: this.accessToken,
                  lang: this.lang || window.navigator.language,
                  outputFormat: this.outputFormat,
                  pitch: this.pitch,
                  rate: this.rate,
                  text: this.text,
                  voice: this.voice && this.voice.voiceURI || undefined,
                  volume: this.volume
                });

                _context2.next = 3;
                return this.arrayBufferPromise;

              case 3:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function preload() {
        return _ref3.apply(this, arguments);
      }

      return preload;
    }()
  }, {
    key: 'play',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(audioContext) {
        var source, audioBuffer;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
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
                _context3.t3 = _context3['catch'](0);

                this.emit('error', { error: _context3.t3, type: 'error' });

                throw _context3.t3;

              case 22:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 18]]);
      }));

      function play(_x3) {
        return _ref4.apply(this, arguments);
      }

      return play;
    }()
  }, {
    key: 'stop',
    value: function stop() {
      this._playingSource && this._playingSource.stop();
    }
  }, {
    key: 'lang',
    get: function get() {
      return this._lang;
    },
    set: function set(value) {
      this._lang = value;
    }
  }, {
    key: 'pitch',
    get: function get() {
      return this._pitch;
    },
    set: function set(value) {
      this._pitch = value;
    }
  }, {
    key: 'rate',
    get: function get() {
      return this._rate;
    },
    set: function set(value) {
      this._rate = value;
    }
  }, {
    key: 'voice',
    get: function get() {
      return this._voice;
    },
    set: function set(value) {
      this._voice = value;
    }
  }, {
    key: 'volume',
    get: function get() {
      return this._volume;
    },
    set: function set(value) {
      this._volume = value;
    }
  }]);
  return _class;
}(_domEventEmitter2.default);

exports.default = _class;
//# sourceMappingURL=SpeechSynthesisUtterance.js.map