const ADD_SPEECH_SYNTHESIS_UTTERANCE = 'ADD_SPEECH_SYNTHESIS_UTTERANCE';

export default function ({ text, voiceURI }) {
  return {
    type: ADD_SPEECH_SYNTHESIS_UTTERANCE,
    payload: {
      utterance: { text, voiceURI }
    }
  };
}

export { ADD_SPEECH_SYNTHESIS_UTTERANCE }
