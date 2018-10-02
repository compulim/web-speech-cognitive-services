'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _exchangeToken = require('./exchangeToken');

var _exchangeToken2 = _interopRequireDefault(_exchangeToken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Token expiration is hardcoded at 10 minutes
// https://docs.microsoft.com/en-us/azure/cognitive-services/Speech/how-to/how-to-authentication?tabs=Powershell#use-an-authorization-token
var TOKEN_EXPIRATION = 600000;
var TOKEN_EARLY_RENEWAL = 60000;

exports.default = function (subscriptionKey) {
  var lastRenew = 0;
  var accessTokenPromise = null;

  return function () {
    if (!lastRenew) {
      console.warn('Subscription key token exchange is not recommended for production code. It will leak your subscription key to the client.');
    }

    var now = Date.now();

    if (!accessTokenPromise || now - lastRenew > TOKEN_EXPIRATION - TOKEN_EARLY_RENEWAL) {
      lastRenew = now;

      accessTokenPromise = (0, _exchangeToken2.default)(subscriptionKey).catch(function (err) {
        // Force to renew on next fetch
        lastRenew = 0;

        return _promise2.default.reject(err);
      });
    }

    return accessTokenPromise;
  };
};
//# sourceMappingURL=createFetchTokenUsingSubscriptionKey.js.map