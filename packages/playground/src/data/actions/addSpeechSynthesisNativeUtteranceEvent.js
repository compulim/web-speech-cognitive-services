const ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE_EVENT = 'ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE_EVENT';

export default function addSpeechSynthesisNativeUtteranceEvent(utteranceID, event) {
  return {
    type: ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE_EVENT,
    payload: {
      event,
      utteranceID
    }
  };
}

export { ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE_EVENT };
