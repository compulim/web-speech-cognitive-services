"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _createFetchTokenUsingSubscriptionKey = _interopRequireDefault(require("./createFetchTokenUsingSubscriptionKey"));

var _default = function _default(tokenUrl) {
  return (0, _createFetchTokenUsingSubscriptionKey.default)(undefined, undefined, tokenUrl);
};

exports.default = _default;
//# sourceMappingURL=getFetchTokenFromServer.js.map