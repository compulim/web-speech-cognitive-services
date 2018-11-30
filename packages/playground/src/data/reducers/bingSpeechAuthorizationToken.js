import { SET_BING_SPEECH_AUTHORIZATION_TOKEN } from '../actions/setBingSpeechAuthorizationToken';

export default function (state = '', { payload, type }) {
  if (type === SET_BING_SPEECH_AUTHORIZATION_TOKEN) {
    return payload.authorizationToken;
  }

  return state;
}
