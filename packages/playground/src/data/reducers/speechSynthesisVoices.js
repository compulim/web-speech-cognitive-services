import { SET_SPEECH_SYNTHESIS_VOICES } from '../actions/setSpeechSynthesisVoices';

export default function (state = [], { payload, type }) {
  if( type === SET_SPEECH_SYNTHESIS_VOICES) {
    return payload.voices;
  }

  return state;
}
