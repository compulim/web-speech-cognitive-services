const SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION = 'SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION';

export default function setSpeechRecognitionTextNormalization(textNormalization) {
  return {
    type: SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION,
    payload: { textNormalization }
  };
}

export { SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION };
