const SET_SPEECH_RECOGNITION_CONTINUOUS = 'SET_SPEECH_RECOGNITION_CONTINUOUS';

export default function (continuous) {
  return {
    type: SET_SPEECH_RECOGNITION_CONTINUOUS,
    payload: { continuous }
  };
}

export { SET_SPEECH_RECOGNITION_CONTINUOUS }
