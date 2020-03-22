import { SET_SPEECH_SYNTHESIS_TEXT } from '../actions/setSpeechSynthesisText';

export default function speechSynthesisText(state = '', { payload, type }) {
  if (type === SET_SPEECH_SYNTHESIS_TEXT) {
    return payload.text;
  }

  return state;
}
