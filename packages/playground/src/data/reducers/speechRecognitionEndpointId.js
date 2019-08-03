import { SET_SPEECH_RECOGNITION_ENDPOINT_ID } from '../actions/setSpeechRecognitionEndpointId';

export default function (state = '', { payload, type }) {
  if (type === SET_SPEECH_RECOGNITION_ENDPOINT_ID) {
    state = payload.endpointId;
  }

  return state;
}
