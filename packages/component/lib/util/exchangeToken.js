"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var TOKEN_URL = 'api.cognitive.microsoft.com/sts/v1.0/issueToken';
var DEFAULT_REGION = 'westus';

function _default(_x) {
  return _ref.apply(this, arguments);
}

function _ref() {
  _ref = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(subscriptionKey) {
    var region,
        tokenUrl,
        res,
        _args = arguments;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            region = _args.length > 1 && _args[1] !== undefined ? _args[1] : DEFAULT_REGION;
            tokenUrl = _args.length > 2 && _args[2] !== undefined ? _args[2] : null;
            _context.next = 4;
            return fetch(tokenUrl || "https://".concat(region, ".").concat(TOKEN_URL), {
              headers: subscriptionKey && {
                'Ocp-Apim-Subscription-Key': subscriptionKey
              },
              method: 'POST'
            });

          case 4:
            res = _context.sent;

            if (!(res.status !== 200)) {
              _context.next = 7;
              break;
            }

            throw new Error("Failed to fetch speech token, server returned ".concat(res.status));

          case 7:
            return _context.abrupt("return", res.text());

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _ref.apply(this, arguments);
}
//# sourceMappingURL=exchangeToken.js.map