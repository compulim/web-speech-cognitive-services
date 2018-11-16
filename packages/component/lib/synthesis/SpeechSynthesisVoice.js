"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _default =
/*#__PURE__*/
function () {
  function _default(_ref) {
    var gender = _ref.gender,
        lang = _ref.lang,
        voiceURI = _ref.voiceURI;
    (0, _classCallCheck2.default)(this, _default);
    this._gender = gender;
    this._lang = lang;
    this._name = voiceURI;
    this._voiceURI = voiceURI;
  }

  (0, _createClass2.default)(_default, [{
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
  return _default;
}();

exports.default = _default;
//# sourceMappingURL=SpeechSynthesisVoice.js.map