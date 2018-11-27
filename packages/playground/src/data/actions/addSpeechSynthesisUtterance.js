const ADD_SPEECH_SYNTHESIS_UTTERANCE = 'ADD_SPEECH_SYNTHESIS_UTTERANCE';

export default function (utterance) {
  return {
    type: ADD_SPEECH_SYNTHESIS_UTTERANCE,
    payload: {
      utterance
    }
  };
}

export { ADD_SPEECH_SYNTHESIS_UTTERANCE }
