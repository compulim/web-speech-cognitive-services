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
      const {
        authorizationToken,
        region,
        speechRecognitionHostname,
        speechSynthesisHostname,
        subscriptionKey,
        tokenURL
      } = await resolveFunctionOrReturnValue(credentials);

      if ((!authorizationToken && !subscriptionKey) || (authorizationToken && subscriptionKey)) {
        throw new Error(
          'web-speech-cognitive-services: Either "authorizationToken" or "subscriptionKey" must be provided.'
        );
      } else if (!region && !(speechRecognitionHostname && speechSynthesisHostname && tokenURL)) {
        throw new Error(
          'web-speech-cognitive-services: Either "region" or "speechRecognitionHostname", "speechSynthesisHostname", and "tokenURL" must be set.'
        );
      } else if (region && (speechRecognitionHostname || speechSynthesisHostname || tokenURL)) {
        throw new Error(
          'web-speech-cognitive-services: Only either "region" or "speechRecognitionHostname", "speechSynthesisHostname", and "tokenURL" can be set.'
        );
      } else if (authorizationToken) {
        if (typeof authorizationToken !== 'string') {
          throw new Error('web-speech-cognitive-services: "authorizationToken" must be a string.');
        }
      } else if (typeof subscriptionKey !== 'string') {
        throw new Error('web-speech-cognitive-services: "subscriptionKey" must be a string.');
      }

      if (shouldWarnOnSubscriptionKey && subscriptionKey) {
        console.warn(
          'web-speech-cognitive-services: In production environment, subscription key should not be used, authorization token should be used instead.'
        );

        shouldWarnOnSubscriptionKey = false;
      }

      const resolvedCredentials = authorizationToken ? { authorizationToken } : { subscriptionKey };

      if (region) {
        resolvedCredentials.region = region;
      } else {
        resolvedCredentials.speechRecognitionHostname = speechRecognitionHostname;
        resolvedCredentials.speechSynthesisHostname = speechSynthesisHostname;
        resolvedCredentials.tokenURL = tokenURL;
      }

      return resolvedCredentials;
    },
    looseEvents
  };
}
