const SET_SPEECH_RECOGNITION_INSTANCE = 'SET_SPEECH_RECOGNITION_INSTANCE';

export default function setSpeechRecognitionInstance(speechRecognition) {
  return {
    type: SET_SPEECH_RECOGNITION_INSTANCE,
    payload: { speechRecognition }
  };
}

export { SET_SPEECH_RECOGNITION_INSTANCE };
