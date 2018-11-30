const SET_BING_SPEECH_SUBSCRIPTION_KEY = 'SET_BING_SPEECH_SUBSCRIPTION_KEY';

export default function (subscriptionKey) {
  return {
    type: SET_BING_SPEECH_SUBSCRIPTION_KEY,
    payload: { subscriptionKey }
  };
}

export { SET_BING_SPEECH_SUBSCRIPTION_KEY }
