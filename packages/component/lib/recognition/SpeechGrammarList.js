'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _simpleUpdateIn = require('simple-update-in');

var _simpleUpdateIn2 = _interopRequireDefault(_simpleUpdateIn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function () {
  function _class() {
    (0, _classCallCheck3.default)(this, _class);

    this._referenceGrammar = null;
    this._words = [];
  }

  (0, _createClass3.default)(_class, [{
    key: 'addFromString',
    value: function addFromString() {
      throw new Error('JSGF is not supported');
    }
  }, {
    key: 'createSpeechContext',
    value: function createSpeechContext() {
      var referenceGrammar = this.referenceGrammar,
          words = this.words;

      var speechContext = void 0;

      if (referenceGrammar) {
        speechContext = (0, _simpleUpdateIn2.default)(speechContext, ['dgi', 'Groups'], function () {
          var groups = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
          return [].concat((0, _toConsumableArray3.default)(groups), [{
            Type: 'Generic',
            Hints: { ReferenceGrammar: referenceGrammar }
          }]);
        });
      }

      if (words && words.length) {
        speechContext = (0, _simpleUpdateIn2.default)(speechContext, ['dgi', 'Groups'], function () {
          var groups = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
          return [].concat((0, _toConsumableArray3.default)(groups), [{
            Type: 'Generic',
            Items: words.map(function (word) {
              return { Text: word };
            })
          }]);
        });
      }

      return speechContext;
    }
  }, {
    key: 'referenceGrammar',
    get: function get() {
      return this._referenceGrammar;
    },
    set: function set(nextReferenceGrammar) {
      if (typeof nextReferenceGrammar !== 'string') {
        throw new Error('referenceGrammar must be a string');
      }

      this._referenceGrammar = nextReferenceGrammar;
    }
  }, {
    key: 'words',
    get: function get() {
      return this._words;
    },
    set: function set(nextWords) {
      if (!Array.isArray(nextWords)) {
        throw new Error('words must be an Array');
      }

      this._words = nextWords;
    }
  }]);
  return _class;
}();

exports.default = _class;
//# sourceMappingURL=SpeechGrammarList.js.map