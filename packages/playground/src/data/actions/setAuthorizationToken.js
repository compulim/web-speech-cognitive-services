const SET_AUTHORIZATION_TOKEN = 'SET_AUTHORIZATION_TOKEN';

export default function (authorizationToken) {
  return {
    type: SET_AUTHORIZATION_TOKEN,
    payload: { authorizationToken }
  };
}

export { SET_AUTHORIZATION_TOKEN }
