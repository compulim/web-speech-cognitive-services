const ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE = 'ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE';

export default function addSpeechSynthesisNativeUtterance(nativeUtterance) {
  return {
    type: ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE,
    payload: { nativeUtterance }
  };
}

export { ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE };
