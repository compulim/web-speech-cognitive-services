const SET_SPEECH_RECOGNITION_ENDPOINT_ID = 'SET_SPEECH_RECOGNITION_ENDPOINT_ID';

export default function setSpeechRecognitionEndpointId(endpointId) {
  return {
    type: SET_SPEECH_RECOGNITION_ENDPOINT_ID,
    payload: { endpointId }
  };
}

export { SET_SPEECH_RECOGNITION_ENDPOINT_ID };
