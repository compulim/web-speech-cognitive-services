const SET_BING_SPEECH_AUTHORIZATION_TOKEN = 'SET_BING_SPEECH_AUTHORIZATION_TOKEN';

export default function (authorizationToken) {
  return {
    type: SET_BING_SPEECH_AUTHORIZATION_TOKEN,
    payload: { authorizationToken }
  };
}

export { SET_BING_SPEECH_AUTHORIZATION_TOKEN }
