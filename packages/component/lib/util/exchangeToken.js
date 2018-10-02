'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TOKEN_URL = 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken';

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(subscriptionKey) {
    var res;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fetch(TOKEN_URL, {
              headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey
              },
              method: 'POST'
            });

          case 2:
            res = _context.sent;

            if (!(res.status !== 200)) {
              _context.next = 5;
              break;
            }

            throw new Error('Failed to fetch speech token, server returned ' + res.status);

          case 5:
            return _context.abrupt('return', res.text());

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=exchangeToken.js.map