"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _exchangeToken = _interopRequireDefault(require("./exchangeToken"));

// Token expiration is hardcoded at 10 minutes
// https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-apis#authentication
var TOKEN_EXPIRATION = 600000;
var TOKEN_EARLY_RENEWAL = 60000;

var _default = function _default(subscriptionKey, region, tokenUrl) {
  var lastRenew = 0;
  var accessTokenPromise = null;
  return function () {
    if (!tokenUrl && !lastRenew) {
      console.warn('Subscription key token exchange is not recommended for production code. It will leak your subscription key to the client.');
    }

    var now = Date.now();

    if (!accessTokenPromise || now - lastRenew > TOKEN_EXPIRATION - TOKEN_EARLY_RENEWAL) {
      lastRenew = now;
      accessTokenPromise = (0, _exchangeToken.default)(subscriptionKey, region, tokenUrl).catch(function (err) {
        // Force to renew on next fetch
        lastRenew = 0;
        return Promise.reject(err);
      });
    }

    return accessTokenPromise;
  };
};

exports.default = _default;
//# sourceMappingURL=createFetchTokenUsingSubscriptionKey.js.map