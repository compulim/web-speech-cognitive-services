import { SET_SPEECH_SYNTHESIS_NATIVE_VOICES } from '../actions/setSpeechSynthesisNativeVoices';

export default function speechSynthesisNativeVoices(state = [], { payload, type }) {
  if (type === SET_SPEECH_SYNTHESIS_NATIVE_VOICES) {
    return payload.voices;
  }

  return state;
}
