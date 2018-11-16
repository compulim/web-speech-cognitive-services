"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _events = _interopRequireDefault(require("events"));

var _default =
/*#__PURE__*/
function () {
  function _default() {
    var _this = this;

    var events = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    (0, _classCallCheck2.default)(this, _default);
    this._events = new _events.default();
    events.forEach(function (name) {
      _this._events.addListener(name, function (event) {
        var handler = _this["on".concat(name)];

        handler && handler.call(_this, event);
      });
    });
  }

  (0, _createClass2.default)(_default, [{
    key: "addEventListener",
    value: function addEventListener(name, listener) {
      this._events.addListener(name, listener);
    }
  }, {
    key: "removeEventListener",
    value: function removeEventListener(name, listener) {
      name ? this._events.removeListener(name, listener) : this._events.removeAllListeners(name);
    }
  }, {
    key: "emit",
    value: function emit(name) {
      var event = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        type: name
      };

      this._events.emit(name, event);
    }
  }]);
  return _default;
}();

exports.default = _default;
//# sourceMappingURL=domEventEmitter.js.map