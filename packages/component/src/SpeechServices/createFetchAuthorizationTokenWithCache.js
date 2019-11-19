import memoize from 'memoize-one';

import fetchAuthorizationToken from './fetchAuthorizationToken';

// Based on this article, the token is expected to expire after 10 minutes.
// https://docs.microsoft.com/en-us/azure/cognitive-services/authentication#authenticate-with-an-authentication-token

const TOKEN_EARLY_RENEWAL = 60000;
const TOKEN_EXPIRATION = 600000;

export default function createCachedFetchAuthorizationToken() {
  const fetchMemoizedAuthorizationToken = memoize(
    (region, subscriptionKey) => fetchAuthorizationToken({ region, subscriptionKey }),
    ([region, subscriptionKey, now], [prevRegion, prevSubscriptionKey, prevNow]) =>
      region === prevRegion
      && subscriptionKey === prevSubscriptionKey
      && now - prevNow < TOKEN_EXPIRATION - TOKEN_EARLY_RENEWAL
  );

  return ({ region, subscriptionKey }) => fetchMemoizedAuthorizationToken(
    region,
    subscriptionKey,
    Date.now()
  );
}
