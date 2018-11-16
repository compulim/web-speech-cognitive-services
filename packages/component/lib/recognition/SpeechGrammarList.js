"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _simpleUpdateIn = _interopRequireDefault(require("simple-update-in"));

var _default =
/*#__PURE__*/
function () {
  function _default() {
    (0, _classCallCheck2.default)(this, _default);
    this._referenceGrammar = null;
    this._words = [];
  }

  (0, _createClass2.default)(_default, [{
    key: "addFromString",
    value: function addFromString() {
      throw new Error('JSGF is not supported');
    }
  }, {
    key: "createSpeechContext",
    value: function createSpeechContext() {
      var referenceGrammar = this.referenceGrammar,
          words = this.words;
      var speechContext;

      if (referenceGrammar) {
        speechContext = (0, _simpleUpdateIn.default)(speechContext, ['dgi', 'Groups'], function () {
          var groups = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
          return (0, _toConsumableArray2.default)(groups).concat([{
            Type: 'Generic',
            Hints: {
              ReferenceGrammar: referenceGrammar
            }
          }]);
        });
      }

      if (words && words.length) {
        speechContext = (0, _simpleUpdateIn.default)(speechContext, ['dgi', 'Groups'], function () {
          var groups = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
          return (0, _toConsumableArray2.default)(groups).concat([{
            Type: 'Generic',
            Items: words.map(function (word) {
              return {
                Text: word
              };
            })
          }]);
        });
      }

      return speechContext;
    }
  }, {
    key: "referenceGrammar",
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
    key: "words",
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
  return _default;
}();

exports.default = _default;
//# sourceMappingURL=SpeechGrammarList.js.map