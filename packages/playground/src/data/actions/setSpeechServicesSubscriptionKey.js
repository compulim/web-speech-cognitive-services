const SET_SPEECH_SERVICES_SUBSCRIPTION_KEY = 'SET_SPEECH_SERVICES_SUBSCRIPTION_KEY';

export default function setSpeechServicesSubscriptionKey(subscriptionKey) {
  return {
    type: SET_SPEECH_SERVICES_SUBSCRIPTION_KEY,
    payload: { subscriptionKey }
  };
}

export { SET_SPEECH_SERVICES_SUBSCRIPTION_KEY };
