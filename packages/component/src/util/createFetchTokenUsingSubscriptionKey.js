import exchangeToken from './exchangeToken';

// Token expiration is hardcoded at 10 minutes
// https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-apis#authentication
const TOKEN_EXPIRATION = 600000;
const TOKEN_EARLY_RENEWAL = 60000;

export default (subscriptionKey, region, tokenUrl) => {
  let lastRenew = 0;
  let accessTokenPromise = null;

  return () => {
    if (!tokenUrl && !lastRenew) {
      console.warn('Subscription key token exchange is not recommended for production code. It will leak your subscription key to the client.');
    }

    const now = Date.now();

    if (!accessTokenPromise || now - lastRenew > TOKEN_EXPIRATION - TOKEN_EARLY_RENEWAL) {
      lastRenew = now;

      accessTokenPromise = exchangeToken(subscriptionKey, region, tokenUrl).catch(err => {
        // Force to renew on next fetch
        lastRenew = 0;

        return Promise.reject(err);
      });
    }

    return accessTokenPromise;
  }
}
