import { SET_SPEECH_SERVICES_SUBSCRIPTION_KEY } from '../actions/setSpeechServicesSubscriptionKey.ts';

export default function speechServicesSubscriptionKey(state = '', { payload, type }) {
  if (type === SET_SPEECH_SERVICES_SUBSCRIPTION_KEY) {
    state = payload.subscriptionKey;
  }

  return state;
}
