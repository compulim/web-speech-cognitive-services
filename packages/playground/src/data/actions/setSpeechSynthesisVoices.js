const SET_SPEECH_SYNTHESIS_VOICES = 'SET_SPEECH_SYNTHESIS_VOICES';

export default function (voices) {
  return {
    type: SET_SPEECH_SYNTHESIS_VOICES,
    payload: { voices }
  };
}

export { SET_SPEECH_SYNTHESIS_VOICES }
