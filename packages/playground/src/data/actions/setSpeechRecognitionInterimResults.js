const SET_SPEECH_RECOGNITION_INTERIM_RESULTS = 'SET_SPEECH_RECOGNITION_INTERIM_RESULTS';

export default function setSpeechRecognitionInterimResults(interimResults) {
  return {
    type: SET_SPEECH_RECOGNITION_INTERIM_RESULTS,
    payload: { interimResults }
  };
}

export { SET_SPEECH_RECOGNITION_INTERIM_RESULTS };
