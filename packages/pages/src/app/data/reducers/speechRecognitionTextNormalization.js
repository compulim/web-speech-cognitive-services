import { SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION } from '../actions/setSpeechRecognitionTextNormalization.ts';

export default function speechRecognitionTextNormalization(state = 'display', { payload, type }) {
  if (type === SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION) {
    state = payload.textNormalization;
  }

  return state;
}
