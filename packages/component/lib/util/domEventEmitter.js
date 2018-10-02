'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function () {
  function _class() {
    var _this = this;

    var events = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    (0, _classCallCheck3.default)(this, _class);

    this._events = new _events2.default();

    events.forEach(function (name) {
      _this._events.addListener(name, function (event) {
        var handler = _this['on' + name];

        handler && handler.call(_this, event);
      });
    });
  }

  (0, _createClass3.default)(_class, [{
    key: 'addEventListener',
    value: function addEventListener(name, listener) {
      this._events.addListener(name, listener);
    }
  }, {
    key: 'removeEventListener',
    value: function removeEventListener(name, listener) {
      name ? this._events.removeListener(name, listener) : this._events.removeAllListeners(name);
    }
  }, {
    key: 'emit',
    value: function emit(name) {
      var event = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { type: name };

      this._events.emit(name, event);
    }
  }]);
  return _class;
}();

exports.default = _class;
//# sourceMappingURL=domEventEmitter.js.map