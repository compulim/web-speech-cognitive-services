import { SET_SPEECH_RECOGNITION_INTERIM_RESULTS } from '../actions/setSpeechRecognitionInterimResults';

export default function speechRecognitionInterimResults(state = false, { payload, type }) {
  if (type === SET_SPEECH_RECOGNITION_INTERIM_RESULTS) {
    state = payload.interimResults;
  }

  return state;
}
