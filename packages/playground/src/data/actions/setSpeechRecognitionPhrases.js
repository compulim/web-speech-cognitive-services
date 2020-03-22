const SET_SPEECH_RECOGNITION_PHRASES = 'SET_SPEECH_RECOGNITION_PHRASES';

export default function setSpeechRecognitionPhrases(phrases) {
  return {
    type: SET_SPEECH_RECOGNITION_PHRASES,
    payload: { phrases }
  };
}

export { SET_SPEECH_RECOGNITION_PHRASES };
