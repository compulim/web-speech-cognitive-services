const SET_SPEECH_SYNTHESIS_VOICE_URI = 'SET_SPEECH_SYNTHESIS_VOICE_URI';

export default function setSpeechSynthesisVoiceURI(voiceURI) {
  return {
    type: SET_SPEECH_SYNTHESIS_VOICE_URI,
    payload: {
      voiceURI
    }
  };
}

export { SET_SPEECH_SYNTHESIS_VOICE_URI };
