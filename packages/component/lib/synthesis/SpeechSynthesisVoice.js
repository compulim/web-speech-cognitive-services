"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function () {
  function _class(_ref) {
    var gender = _ref.gender,
        lang = _ref.lang,
        voiceURI = _ref.voiceURI;
    (0, _classCallCheck3.default)(this, _class);

    this._gender = gender;
    this._lang = lang;
    this._name = voiceURI;
    this._voiceURI = voiceURI;
  }

  (0, _createClass3.default)(_class, [{
    key: "default",
    get: function get() {
      return false;
    }
  }, {
    key: "gender",
    get: function get() {
      return this._gender;
    }
  }, {
    key: "lang",
    get: function get() {
      return this._lang;
    }
  }, {
    key: "localService",
    get: function get() {
      return false;
    }
  }, {
    key: "name",
    get: function get() {
      return this._name;
    }
  }, {
    key: "voiceURI",
    get: function get() {
      return this._voiceURI;
    }
  }]);
  return _class;
}();

exports.default = _class;
//# sourceMappingURL=SpeechSynthesisVoice.js.map