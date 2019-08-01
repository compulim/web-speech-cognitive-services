const SET_SPEECH_RECOGNITION_REFERENCE_GRAMMARS = 'SET_SPEECH_RECOGNITION_REFERENCE_GRAMMARS';

export default function (referenceGrammars) {
  return {
    type: SET_SPEECH_RECOGNITION_REFERENCE_GRAMMARS,
    payload: { referenceGrammars }
  };
}

export { SET_SPEECH_RECOGNITION_REFERENCE_GRAMMARS }
