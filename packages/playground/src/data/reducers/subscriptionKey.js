import { SET_SUBSCRIPTION_KEY } from '../actions/setSubscriptionKey';

const urlSearchParams = new URLSearchParams(window.location.search);
const defaultSubscriptionKey = urlSearchParams.get('s');

export default function (state = defaultSubscriptionKey, { payload, type }) {
  if (type === SET_SUBSCRIPTION_KEY) {
    state = payload.subscriptionKey;
  }

  return state;
}
