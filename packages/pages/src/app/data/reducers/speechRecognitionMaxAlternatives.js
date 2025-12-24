import { SET_SPEECH_RECOGNITION_MAX_ALTERNATIVES } from '../actions/setSpeechRecognitionMaxAlternatives.ts';

export default function speechRecognitionMaxAlternatives(state = 1, { payload, type }) {
  if (type === SET_SPEECH_RECOGNITION_MAX_ALTERNATIVES) {
    return payload.maxAlternatives;
  }

  return state;
}
