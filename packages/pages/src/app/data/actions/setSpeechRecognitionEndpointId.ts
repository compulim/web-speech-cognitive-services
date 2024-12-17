const SET_SPEECH_RECOGNITION_ENDPOINT_ID = 'SET_SPEECH_RECOGNITION_ENDPOINT_ID' as const;

export type SetSpeechRecognitionEndpointIdAction = Readonly<{
  payload: Readonly<{ endpointId: string }>;
  type: typeof SET_SPEECH_RECOGNITION_ENDPOINT_ID;
}>;

export default function setSpeechRecognitionEndpointId(
  endpointId: SetSpeechRecognitionEndpointIdAction['payload']['endpointId']
): SetSpeechRecognitionEndpointIdAction {
  return Object.freeze({
    payload: Object.freeze({ endpointId }),
    type: SET_SPEECH_RECOGNITION_ENDPOINT_ID
  });
}

export { SET_SPEECH_RECOGNITION_ENDPOINT_ID };
