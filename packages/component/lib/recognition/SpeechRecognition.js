"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var CognitiveSpeech = _interopRequireWildcard(require("microsoft-speech-browser-sdk"));

var _eventAsPromise = _interopRequireDefault(require("event-as-promise"));

var _memoizeOne = _interopRequireDefault(require("memoize-one"));

var _SpeechGrammarList = _interopRequireDefault(require("./SpeechGrammarList"));

function buildSpeechResult(transcript, confidence, isFinal) {
  var result = [{
    confidence: confidence,
    transcript: transcript
  }];
  result.isFinal = isFinal;
  return {
    results: [result],
    type: 'result'
  };
}

var _default =
/*#__PURE__*/
function () {
  function _default() {
    var _this = this;

    (0, _classCallCheck2.default)(this, _default);
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
    this.createRecognizer = (0, _memoizeOne.default)(function () {
      var lang = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : navigator.language;
      var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CognitiveSpeech.RecognitionMode.Interactive;
      var osPlatform = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window.navigator.userAgent;
      var osName = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : window.navigator.appName;
      var osVersion = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : window.navigator.appVersion;
      var deviceManufacturer = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'microsoft-speech-browser-sdk';
      var deviceModel = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'web-speech-cognitive-services';
      var deviceVersion = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : "3.0.2-0";
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

  (0, _createClass2.default)(_default, [{
    key: "abort",
    value: function abort() {
      // TODO: Should redesign how to stop a recognition session
      //       After abort is called, we should not saw it is a "success", "silent", or "no match"
      var _ref = this.recognizer || {},
          AudioSource = _ref.AudioSource;

      AudioSource && AudioSource.TurnOff();
      this._aborted = true;
    }
  }, {
    key: "emit",
    value: function emit(name, event) {
      var listener = this["on".concat(name)];
      listener && listener.call(this, (0, _objectSpread2.default)({}, event, {
        type: name
      }));
    }
  }, {
    key: "stop",
    value: function stop() {
      // TODO: Support stop
      throw new Error('not supported');
    }
  }, {
    key: "start",
    value: function () {
      var _start = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee() {
        var recognizer, _toPromise, eventListener, promises, speechContext, error, listeningStarted, recognitionStarted, gotFirstHypothesis, speechHypothesis, speechDetailedPhrase, recognitionResult;

        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                recognizer = this.recognizer = this.createRecognizer(this.lang, this.osPlatform || window.navigator.userAgent, this.osName || window.navigator.appName, this.osVersion || window.navigator.appVersion, this.deviceManufacturer || 'web-speech-cognitive-services', this.deviceModel || 'web-speech-cognitive-services', this.deviceVersion || "3.0.2-0");
                _toPromise = toPromise(), eventListener = _toPromise.eventListener, promises = (0, _objectWithoutProperties2.default)(_toPromise, ["eventListener"]);
                speechContext = this.grammars && this.grammars.createSpeechContext();
                recognizer.Recognize(eventListener, speechContext && JSON.stringify(speechContext));
                this._aborted = false;
                _context.next = 7;
                return promises.recognitionTriggered;

              case 7:
                _context.next = 9;
                return Promise.race([promises.listeningStarted, promises.recognitionEnded]);

              case 9:
                listeningStarted = _context.sent;

                if (!(listeningStarted.Name === 'RecognitionEndedEvent')) {
                  _context.next = 14;
                  break;
                }

                // Possibly not authorized to use microphone
                if (listeningStarted.Status === CognitiveSpeech.RecognitionCompletionStatus.AudioSourceError) {
                  error = 'not-allowed';
                } else {
                  error = CognitiveSpeech.RecognitionCompletionStatus[listeningStarted.Status];
                }

                _context.next = 50;
                break;

              case 14:
                this.emit('start');
                _context.next = 17;
                return promises.connectingToService;

              case 17:
                _context.next = 19;
                return Promise.race([promises.recognitionStarted, promises.recognitionEnded]);

              case 19:
                recognitionStarted = _context.sent;
                this.emit('audiostart');

                if (!(recognitionStarted.Name === 'RecognitionEndedEvent')) {
                  _context.next = 25;
                  break;
                }

                // Possibly network error
                if (recognitionStarted.Status === CognitiveSpeech.RecognitionCompletionStatus.ConnectError) {
                  error = 'network';
                } else {
                  error = CognitiveSpeech.RecognitionCompletionStatus[recognitionStarted.Status];
                }

                _context.next = 35;
                break;

              case 25:
                _context.next = 27;
                return Promise.race([promises.getSpeechHypothesisPromise(), promises.speechEndDetected]);

              case 27:
                speechHypothesis = _context.sent;

                if (!(speechHypothesis.Name === 'SpeechEndDetectedEvent')) {
                  _context.next = 30;
                  break;
                }

                return _context.abrupt("break", 34);

              case 30:
                if (!gotFirstHypothesis) {
                  gotFirstHypothesis = true;
                  this.emit('soundstart');
                  this.emit('speechstart');
                }

                this.emit('result', buildSpeechResult(speechHypothesis.Result.Text, .5, false));

              case 32:
                _context.next = 25;
                break;

              case 34:
                if (gotFirstHypothesis) {
                  this.emit('speechend');
                  this.emit('soundend');
                }

              case 35:
                this.emit('audioend');

                if (!this._aborted) {
                  _context.next = 42;
                  break;
                }

                error = 'aborted';
                _context.next = 40;
                return promises.recognitionEnded;

              case 40:
                _context.next = 50;
                break;

              case 42:
                _context.next = 44;
                return Promise.race([promises.speechDetailedPhrase, promises.recognitionEnded]);

              case 44:
                speechDetailedPhrase = _context.sent;

                if (!(speechDetailedPhrase.Name !== 'RecognitionEndedEvent')) {
                  _context.next = 50;
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

                _context.next = 50;
                return promises.recognitionEnded;

              case 50:
                error && this.emit('error', {
                  error: error
                });
                this.emit('end');

              case 52:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function start() {
        return _start.apply(this, arguments);
      };
    }()
  }, {
    key: "grammars",
    get: function get() {
      return this._grammars;
    },
    set: function set(nextGrammars) {
      if (nextGrammars && !(nextGrammars instanceof _SpeechGrammarList.default)) {
        throw new Error('must be instance of SpeechGrammarList from "web-speech-cognitive-services"');
      }

      this._grammars = nextGrammars;
    }
  }, {
    key: "lang",
    get: function get() {
      return this._lang;
    },
    set: function set(nextLang) {
      this._lang = nextLang;
    }
  }, {
    key: "continuous",
    get: function get() {
      return false;
    },
    set: function set(nextContinuous) {
      throw new Error('not supported');
    }
  }, {
    key: "interimResults",
    get: function get() {
      return true;
    },
    set: function set(nextInterimResults) {
      if (!nextInterimResults) {
        throw new Error('not supported');
      }
    }
  }, {
    key: "maxAlternatives",
    get: function get() {
      return 1;
    },
    set: function set(nextMaxAlternatives) {
      throw new Error('not supported');
    }
  }, {
    key: "serviceURI",
    get: function get() {
      return null;
    },
    set: function set(nextServiceURI) {
      throw new Error('not supported');
    }
  }]);
  return _default;
}();

exports.default = _default;

function toPromise() {
  var events = {
    ConnectingToServiceEvent: new _eventAsPromise.default(),
    ListeningStartedEvent: new _eventAsPromise.default(),
    RecognitionEndedEvent: new _eventAsPromise.default(),
    RecognitionStartedEvent: new _eventAsPromise.default(),
    RecognitionTriggeredEvent: new _eventAsPromise.default(),
    SpeechDetailedPhraseEvent: new _eventAsPromise.default(),
    SpeechEndDetectedEvent: new _eventAsPromise.default(),
    SpeechHypothesisEvent: new _eventAsPromise.default(),
    SpeechSimplePhraseEvent: new _eventAsPromise.default(),
    SpeechStartDetectedEvent: new _eventAsPromise.default()
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
        console.warn("Unexpected event \"".concat(name, "\" from Cognitive Services, please file a bug to https://github.com/compulim/web-speech-cognitive-services"));
      }
    }
  };
}
//# sourceMappingURL=SpeechRecognition.js.map