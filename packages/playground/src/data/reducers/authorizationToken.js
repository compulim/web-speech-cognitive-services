import { SET_AUTHORIZATION_TOKEN } from '../actions/setAuthorizationToken';

export default function (state = '', { payload, type }) {
  if (type === SET_AUTHORIZATION_TOKEN) {
    return payload.authorizationToken;
  }

  return state;
}
