'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _microsoftSpeechBrowserSdk = require('microsoft-speech-browser-sdk');

var CognitiveSpeech = _interopRequireWildcard(_microsoftSpeechBrowserSdk);

var _eventAsPromise = require('event-as-promise');

var _eventAsPromise2 = _interopRequireDefault(_eventAsPromise);

var _memoizeOne = require('memoize-one');

var _memoizeOne2 = _interopRequireDefault(_memoizeOne);

var _SpeechGrammarList = require('./SpeechGrammarList');

var _SpeechGrammarList2 = _interopRequireDefault(_SpeechGrammarList);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildSpeechResult(transcript, confidence, isFinal) {
  var result = [{ confidence: confidence, transcript: transcript }];

  result.isFinal = isFinal;

  return { results: [result], type: 'result' };
}

var _class = function () {
  function _class() {
    var _this = this;

    (0, _classCallCheck3.default)(this, _class);

    this._lang = '';

    this.readyState = 0;

    this.onaudiostart = null;
    this.onaudioend = null;
    this.onend = null;
    this.onerror = null;
    this.onnomatch = null;
    this.onresult = null;
    this.onsoundstart = null;
    this.onsoundend = null;
    this.onspeechstart = null;
    this.onspeechend = null;
    this.onstart = null;

    this.createRecognizer = (0, _memoizeOne2.default)(function () {
      var lang = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : navigator.language;
      var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CognitiveSpeech.RecognitionMode.Interactive;
      var osPlatform = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window.navigator.userAgent;
      var osName = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : window.navigator.appName;
      var osVersion = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : window.navigator.appVersion;
      var deviceManufacturer = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'microsoft-speech-browser-sdk';
      var deviceModel = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'web-speech-cognitive-services';
      var deviceVersion = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : "1.0.0";

      var config = new CognitiveSpeech.RecognizerConfig(new CognitiveSpeech.SpeechConfig(new CognitiveSpeech.Context(new CognitiveSpeech.OS(osPlatform, osName, osVersion), new CognitiveSpeech.Device(deviceManufacturer, deviceModel, deviceVersion))), mode, lang, CognitiveSpeech.SpeechResultFormat.Detailed);

      var fetchToken = function fetchToken() {
        try {
          var _sink = new CognitiveSpeech.Sink();

          if (!_this.fetchToken) {
            console.error('SpeechRecognition: fetchToken must be set');

            return _sink.Reject('fetchToken must be set');
          } else if (typeof _this.fetchToken !== 'function') {
            console.error('SpeechRecognition: fetchToken must be a function that returns a Promise and it will resolve to a string-based token');

            return _sink.Reject('fetchToken must be a function that returns a Promise and it will resolve to a string-based token');
          }

          _this.fetchToken().then(_sink.Resolve, _sink.Reject);

          return new CognitiveSpeech.Promise(_sink);
        } catch (err) {
          sink.Reject(err.message);
        }
      };

      return CognitiveSpeech.CreateRecognizer(config, new CognitiveSpeech.CognitiveTokenAuthentication(fetchToken, fetchToken));
    });
  }

  (0, _createClass3.default)(_class, [{
    key: 'abort',
    value: function abort() {
      // TODO: Should redesign how to stop a recognition session
      //       After abort is called, we should not saw it is a "success", "silent", or "no match"
      var _ref = this.recognizer || {},
          AudioSource = _ref.AudioSource;

      AudioSource && AudioSource.TurnOff();

      this._aborted = true;
    }
  }, {
    key: 'emit',
    value: function emit(name, event) {
      var listener = this['on' + name];

      listener && listener.call(this, (0, _extends3.default)({}, event, { type: name }));
    }
  }, {
    key: 'stop',
    value: function stop() {
      // TODO: Support stop
      throw new Error('not supported');
    }
  }, {
    key: 'start',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var recognizer, _toPromise, eventListener, promises, speechContext, error, listeningStarted, recognitionStarted, gotFirstHypothesis, speechHypothesis, speechDetailedPhrase, recognitionResult;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                recognizer = this.recognizer = this.createRecognizer(this.lang, this.osPlatform || window.navigator.userAgent, this.osName || window.navigator.appName, this.osVersion || window.navigator.appVersion, this.deviceManufacturer || 'web-speech-cognitive-services', this.deviceModel || 'web-speech-cognitive-services', this.deviceVersion || "1.0.0");
                _toPromise = toPromise(), eventListener = _toPromise.eventListener, promises = (0, _objectWithoutProperties3.default)(_toPromise, ['eventListener']);
                speechContext = this.grammars && this.grammars.createSpeechContext();


                recognizer.Recognize(eventListener, speechContext && (0, _stringify2.default)(speechContext));
                this._aborted = false;

                _context.next = 7;
                return promises.recognitionTriggered;

              case 7:
                error = void 0;
                _context.next = 10;
                return _promise2.default.race([promises.listeningStarted, promises.recognitionEnded]);

              case 10:
                listeningStarted = _context.sent;

                if (!(listeningStarted.Name === 'RecognitionEndedEvent')) {
                  _context.next = 15;
                  break;
                }

                // Possibly not authorized to use microphone
                if (listeningStarted.Status === CognitiveSpeech.RecognitionCompletionStatus.AudioSourceError) {
                  error = 'not-allowed';
                } else {
                  error = CognitiveSpeech.RecognitionCompletionStatus[listeningStarted.Status];
                }
                _context.next = 52;
                break;

              case 15:
                this.emit('start');

                _context.next = 18;
                return promises.connectingToService;

              case 18:
                _context.next = 20;
                return _promise2.default.race([promises.recognitionStarted, promises.recognitionEnded]);

              case 20:
                recognitionStarted = _context.sent;


                this.emit('audiostart');

                if (!(recognitionStarted.Name === 'RecognitionEndedEvent')) {
                  _context.next = 26;
                  break;
                }

                // Possibly network error
                if (recognitionStarted.Status === CognitiveSpeech.RecognitionCompletionStatus.ConnectError) {
                  error = 'network';
                } else {
                  error = CognitiveSpeech.RecognitionCompletionStatus[recognitionStarted.Status];
                }
                _context.next = 37;
                break;

              case 26:
                gotFirstHypothesis = void 0;

              case 27:
                _context.next = 29;
                return _promise2.default.race([promises.getSpeechHypothesisPromise(), promises.speechEndDetected]);

              case 29:
                speechHypothesis = _context.sent;

                if (!(speechHypothesis.Name === 'SpeechEndDetectedEvent')) {
                  _context.next = 32;
                  break;
                }

                return _context.abrupt('break', 36);

              case 32:

                if (!gotFirstHypothesis) {
                  gotFirstHypothesis = true;
                  this.emit('soundstart');
                  this.emit('speechstart');
                }

                this.emit('result', buildSpeechResult(speechHypothesis.Result.Text, .5, false));

              case 34:
                _context.next = 27;
                break;

              case 36:

                if (gotFirstHypothesis) {
                  this.emit('speechend');
                  this.emit('soundend');
                }

              case 37:

                this.emit('audioend');

                if (!this._aborted) {
                  _context.next = 44;
                  break;
                }

                error = 'aborted';

                _context.next = 42;
                return promises.recognitionEnded;

              case 42:
                _context.next = 52;
                break;

              case 44:
                _context.next = 46;
                return _promise2.default.race([promises.speechDetailedPhrase, promises.recognitionEnded]);

              case 46:
                speechDetailedPhrase = _context.sent;

                if (!(speechDetailedPhrase.Name !== 'RecognitionEndedEvent')) {
                  _context.next = 52;
                  break;
                }

                recognitionResult = CognitiveSpeech.RecognitionStatus[speechDetailedPhrase.Result.RecognitionStatus];


                if (recognitionResult === CognitiveSpeech.RecognitionStatus.Success) {
                  this.emit('result', buildSpeechResult(speechDetailedPhrase.Result.NBest[0].Display, speechDetailedPhrase.Result.NBest[0].Confidence, true));
                } else if (recognitionResult !== CognitiveSpeech.RecognitionStatus.NoMatch) {
                  // Possibly silent or muted
                  if (recognitionResult === CognitiveSpeech.RecognitionStatus.InitialSilenceTimeout) {
                    error = 'no-speech';
                  } else {
                    error = speechDetailedPhrase.Result.RecognitionStatus;
                  }
                }

                _context.next = 52;
                return promises.recognitionEnded;

              case 52:

                error && this.emit('error', { error: error });
                this.emit('end');

              case 54:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function start() {
        return _ref2.apply(this, arguments);
      }

      return start;
    }()
  }, {
    key: 'grammars',
    get: function get() {
      return this._grammars;
    },
    set: function set(nextGrammars) {
      if (nextGrammars && !(nextGrammars instanceof _SpeechGrammarList2.default)) {
        throw new Error('must be instance of SpeechGrammarList from "web-speech-cognitive-services"');
      }

      this._grammars = nextGrammars;
    }
  }, {
    key: 'lang',
    get: function get() {
      return this._lang;
    },
    set: function set(nextLang) {
      this._lang = nextLang;
    }
  }, {
    key: 'continuous',
    get: function get() {
      return false;
    },
    set: function set(nextContinuous) {
      throw new Error('not supported');
    }
  }, {
    key: 'interimResults',
    get: function get() {
      return true;
    },
    set: function set(nextInterimResults) {
      if (!nextInterimResults) {
        throw new Error('not supported');
      }
    }
  }, {
    key: 'maxAlternatives',
    get: function get() {
      return 1;
    },
    set: function set(nextMaxAlternatives) {
      throw new Error('not supported');
    }
  }, {
    key: 'serviceURI',
    get: function get() {
      return null;
    },
    set: function set(nextServiceURI) {
      throw new Error('not supported');
    }
  }]);
  return _class;
}();

exports.default = _class;


function toPromise() {
  var events = {
    ConnectingToServiceEvent: new _eventAsPromise2.default(),
    ListeningStartedEvent: new _eventAsPromise2.default(),
    RecognitionEndedEvent: new _eventAsPromise2.default(),
    RecognitionStartedEvent: new _eventAsPromise2.default(),
    RecognitionTriggeredEvent: new _eventAsPromise2.default(),
    SpeechDetailedPhraseEvent: new _eventAsPromise2.default(),
    SpeechEndDetectedEvent: new _eventAsPromise2.default(),
    SpeechHypothesisEvent: new _eventAsPromise2.default(),
    SpeechSimplePhraseEvent: new _eventAsPromise2.default(),
    SpeechStartDetectedEvent: new _eventAsPromise2.default()
  };

  return {
    connectingToService: events.ConnectingToServiceEvent.upcoming(),
    listeningStarted: events.ListeningStartedEvent.upcoming(),
    recognitionEnded: events.RecognitionEndedEvent.upcoming(),
    recognitionStarted: events.RecognitionStartedEvent.upcoming(),
    recognitionTriggered: events.RecognitionTriggeredEvent.upcoming(),
    speechDetailedPhrase: events.SpeechDetailedPhraseEvent.upcoming(),
    speechEndDetected: events.SpeechEndDetectedEvent.upcoming(),
    getSpeechHypothesisPromise: function getSpeechHypothesisPromise() {
      return events.SpeechHypothesisEvent.upcoming();
    },
    speechSimplePhrase: events.SpeechSimplePhraseEvent.upcoming(),
    speechStartDetected: events.SpeechStartDetectedEvent.upcoming(),
    eventListener: function eventListener(event) {
      var name = event.Name;

      var eventAsPromise = events[name];

      if (eventAsPromise) {
        eventAsPromise.eventListener.call(null, event);
      } else {
        console.warn('Unexpected event "' + name + '" from Cognitive Services, please file a bug to https://github.com/compulim/web-speech-cognitive-services');
      }
    }
  };
}
//# sourceMappingURL=SpeechRecognition.js.map