const SET_SPEECH_RECOGNITION_MAX_ALTERNATIVES = 'SET_SPEECH_RECOGNITION_MAX_ALTERNATIVES';

export default function setSpeechRecognitionMaxAlternatives(maxAlternatives) {
  return {
    type: SET_SPEECH_RECOGNITION_MAX_ALTERNATIVES,
    payload: { maxAlternatives }
  };
}

export { SET_SPEECH_RECOGNITION_MAX_ALTERNATIVES };
