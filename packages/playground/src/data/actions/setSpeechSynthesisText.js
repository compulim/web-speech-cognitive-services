const SET_SPEECH_SYNTHESIS_TEXT = 'SET_SPEECH_SYNTHESIS_TEXT';

export default function (text) {
  return {
    type: SET_SPEECH_SYNTHESIS_TEXT,
    payload: { text }
  };
}

export { SET_SPEECH_SYNTHESIS_TEXT }
