import { SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN } from '../actions/setSpeechServicesAuthorizationToken';

export default function speechServicesAuthorizationToken(state = '', { payload, type }) {
  if (type === SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN) {
    return payload.authorizationToken;
  }

  return state;
}
