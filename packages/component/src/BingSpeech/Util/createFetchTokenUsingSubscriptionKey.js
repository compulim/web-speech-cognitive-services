import fetchAuthorizationToken from '../fetchAuthorizationToken';

// Token expiration is hardcoded at 10 minutes
// https://docs.microsoft.com/en-us/azure/cognitive-services/Speech/how-to/how-to-authentication?tabs=Powershell#use-an-authorization-token
const TOKEN_EXPIRATION = 600000;
const TOKEN_EARLY_RENEWAL = 60000;

export default subscriptionKey => {
  let lastRenew = 0;
  let accessTokenPromise = null;

  return () => {
    if (!lastRenew) {
      console.warn('Subscription key token exchange is not recommended for production code. It will leak your subscription key to the client.');
    }

    const now = Date.now();

    if (!accessTokenPromise || now - lastRenew > TOKEN_EXPIRATION - TOKEN_EARLY_RENEWAL) {
      lastRenew = now;

      accessTokenPromise = fetchAuthorizationToken(subscriptionKey).catch(err => {
        // Force to renew on next fetch
        lastRenew = 0;

        return Promise.reject(err);
      });
    }

    return accessTokenPromise;
  }
}
