const SET_SPEECH_SERVICES_SUBSCRIPTION_KEY = 'SET_SPEECH_SERVICES_SUBSCRIPTION_KEY' as const;

export type SetSpeechServicesSubscriptionKeyAction = Readonly<{
  payload: Readonly<{ subscriptionKey: string }>;
  type: typeof SET_SPEECH_SERVICES_SUBSCRIPTION_KEY;
}>;

export default function setSpeechServicesSubscriptionKey(
  subscriptionKey: SetSpeechServicesSubscriptionKeyAction['payload']['subscriptionKey']
): SetSpeechServicesSubscriptionKeyAction {
  return {
    payload: Object.freeze({ subscriptionKey }),
    type: SET_SPEECH_SERVICES_SUBSCRIPTION_KEY
  };
}

export { SET_SPEECH_SERVICES_SUBSCRIPTION_KEY };
