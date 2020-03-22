const SET_SPEECH_RECOGNITION_LANGUAGE = 'SET_SPEECH_RECOGNITION_LANGUAGE';

export default function setSpeechRecognitionLanguage(language) {
  return {
    type: SET_SPEECH_RECOGNITION_LANGUAGE,
    payload: { language }
  };
}

export { SET_SPEECH_RECOGNITION_LANGUAGE };
