const CONVERT_SPEECH_SERVICES_SUBSCRIPTION_KEY_TO_AUTHORIZATION_TOKEN =
  'CONVERT_SPEECH_SERVICES_SUBSCRIPTION_KEY_TO_AUTHORIZATION_TOKEN' as const;

export type ConvertSpeechServicesSubscriptionKeyToAuthorizationTokenAction = Readonly<{
  type: typeof CONVERT_SPEECH_SERVICES_SUBSCRIPTION_KEY_TO_AUTHORIZATION_TOKEN;
}>;

export default function convertSpeechServicesSubscriptionKeyToAuthorizationToken(): ConvertSpeechServicesSubscriptionKeyToAuthorizationTokenAction {
  return { type: CONVERT_SPEECH_SERVICES_SUBSCRIPTION_KEY_TO_AUTHORIZATION_TOKEN };
}

export { CONVERT_SPEECH_SERVICES_SUBSCRIPTION_KEY_TO_AUTHORIZATION_TOKEN };
