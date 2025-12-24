import { SET_SPEECH_RECOGNITION_CONTINUOUS } from '../actions/setSpeechRecognitionContinuous.ts';

export default function speechRecognitionContinuous(state = false, { payload, type }) {
  if (type === SET_SPEECH_RECOGNITION_CONTINUOUS) {
    state = payload.continuous;
  }

  return state;
}
