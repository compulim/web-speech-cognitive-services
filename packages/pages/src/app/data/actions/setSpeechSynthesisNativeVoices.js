const SET_SPEECH_SYNTHESIS_NATIVE_VOICES = 'SET_SPEECH_SYNTHESIS_NATIVE_VOICES';

export default function setSpeechSynthesisNativeVoices(voices) {
  return {
    type: SET_SPEECH_SYNTHESIS_NATIVE_VOICES,
    payload: { voices }
  };
}

export { SET_SPEECH_SYNTHESIS_NATIVE_VOICES };
