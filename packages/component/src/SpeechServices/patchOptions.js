import resolveFunctionOrReturnValue from './resolveFunctionOrReturnValue';

let shouldWarnOnSubscriptionKey = true;

export default function patchOptions({
  authorizationToken,
  credentials,
  looseEvent,
  looseEvents,
  region = 'westus',
  subscriptionKey,
  ...otherOptions
} = {}) {
  if (typeof looseEvent !== 'undefined') {
    console.warn('web-speech-cognitive-services: The option "looseEvent" should be named as "looseEvents".');

    looseEvents = looseEvent;
  }

  if (!credentials) {
    if (!authorizationToken && !subscriptionKey) {
      throw new Error('web-speech-cognitive-services: Credentials must be specified.');
    } else {
      console.warn(
        'web-speech-cognitive-services: We are deprecating authorizationToken, region, and subscriptionKey. Please use credentials instead. The deprecated option will be removed on or after 2020-11-14.'
      );

      credentials = async () =>
        authorizationToken
          ? { authorizationToken: await resolveFunctionOrReturnValue(authorizationToken), region }
          : { region, subscriptionKey: await resolveFunctionOrReturnValue(subscriptionKey) };
    }
  }

  return {
    ...otherOptions,
    fetchCredentials: async () => {
      const { authorizationToken, region, subscriptionKey } = await resolveFunctionOrReturnValue(credentials);

      if (!authorizationToken && !subscriptionKey) {
        throw new Error(
          'web-speech-cognitive-services: Either authorization token and subscription key must be provided.'
        );
      }

      if (authorizationToken) {
        if (typeof authorizationToken !== 'string') {
          throw new Error('web-speech-cognitive-services: Authorization token must be a string.');
        }
      } else if (typeof subscriptionKey !== 'string') {
        throw new Error('web-speech-cognitive-services: Subscription key must be a string.');
      }

      if (shouldWarnOnSubscriptionKey && subscriptionKey) {
        console.warn(
          'web-speech-cognitive-services: In production environment, subscription key should not be used, authorization token should be used instead.'
        );

        shouldWarnOnSubscriptionKey = false;
      }

      return authorizationToken ? { authorizationToken, region } : { region, subscriptionKey };
    },
    looseEvents
  };
}
