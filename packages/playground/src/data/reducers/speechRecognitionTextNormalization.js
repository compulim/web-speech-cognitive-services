import { SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION } from '../actions/setSpeechRecognitionTextNormalization';

export default function (state = 'display', { payload, type }) {
  if (type === SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION) {
    state = payload.textNormalization;
  }

  return state;
}
