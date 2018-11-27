import { SET_SUBSCRIPTION_KEY } from '../actions/setSubscriptionKey';

export default function (state = '', { payload, type }) {
  if (type === SET_SUBSCRIPTION_KEY) {
    state = payload.subscriptionKey;
  }

  return state;
}
