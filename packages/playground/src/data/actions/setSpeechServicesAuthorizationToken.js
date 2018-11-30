const SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN = 'SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN';

export default function (authorizationToken) {
  return {
    type: SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN,
    payload: { authorizationToken }
  };
}

export { SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN }
