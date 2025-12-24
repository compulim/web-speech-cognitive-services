import { SET_SPEECH_RECOGNITION_ENDPOINT_ID } from '../actions/setSpeechRecognitionEndpointId.ts';

export default function speechRecognitionEndpointId(state = '', { payload, type }) {
  if (type === SET_SPEECH_RECOGNITION_ENDPOINT_ID) {
    state = payload.endpointId;
  }

  return state;
}
