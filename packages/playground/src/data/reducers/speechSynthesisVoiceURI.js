import { SET_SPEECH_SYNTHESIS_VOICE_URI } from '../actions/setSpeechSynthesisVoiceURI';

export default function (state = null, { payload, type }) {
  if (type === SET_SPEECH_SYNTHESIS_VOICE_URI) {
    return payload.voiceURI;
  }

  return state;
}
