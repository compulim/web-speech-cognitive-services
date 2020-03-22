import { SET_SPEECH_SYNTHESIS_VOICE_URI } from '../actions/setSpeechSynthesisVoiceURI';

export default function speechSynthesisVoiceURI(state = '', { payload, type }) {
  if (type === SET_SPEECH_SYNTHESIS_VOICE_URI) {
    return payload.voiceURI;
  }

  return state;
}
