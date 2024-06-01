const SET_SPEECH_RECOGNITION_DELAYED_START = 'SET_SPEECH_RECOGNITION_DELAYED_START';

export default function setSpeechRecognitionDelayedStart(delay) {
  return {
    type: SET_SPEECH_RECOGNITION_DELAYED_START,
    payload: { delay }
  };
}

export { SET_SPEECH_RECOGNITION_DELAYED_START };
