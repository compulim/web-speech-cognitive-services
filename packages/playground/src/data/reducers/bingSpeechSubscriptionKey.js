import { SET_BING_SPEECH_SUBSCRIPTION_KEY } from '../actions/setBingSpeechSubscriptionKey';

export default function (state = '', { payload, type }) {
  if (type === SET_BING_SPEECH_SUBSCRIPTION_KEY) {
    state = payload.subscriptionKey;
  }

  return state;
}
