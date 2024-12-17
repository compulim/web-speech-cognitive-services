const SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN = 'SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN' as const;

export type SetSpeechServicesAuthorizationToken = Readonly<{
  payload: Readonly<{ authorizationToken: string }>;
  type: typeof SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN;
}>;

export default function setSpeechServicesAuthorizationToken(
  authorizationToken: SetSpeechServicesAuthorizationToken['payload']['authorizationToken']
): SetSpeechServicesAuthorizationToken {
  return Object.freeze({
    payload: Object.freeze({ authorizationToken }),
    type: SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN
  });
}

export { SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN };
