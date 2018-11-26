const SET_SUBSCRIPTION_KEY = 'SET_SUBSCRIPTION_KEY';

export default function (subscriptionKey) {
  return {
    type: SET_SUBSCRIPTION_KEY,
    payload: { subscriptionKey }
  };
}

export { SET_SUBSCRIPTION_KEY }
