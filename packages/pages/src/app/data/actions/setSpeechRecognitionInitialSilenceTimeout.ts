const SET_SPEECH_RECOGNITION_INITIAL_SILENCE_TIMEOUT = 'SET_SPEECH_RECOGNITION_INITIAL_SILENCE_TIMEOUT';

export type SetSpeechRecognitionInitialSilenceTimeoutAction = {
  payload: { initialSilenceTimeout: 'default' | number };
  type: typeof SET_SPEECH_RECOGNITION_INITIAL_SILENCE_TIMEOUT;
};

export default function setSpeechRecognitionInitialSilenceTimeout(
  initialSilenceTimeout: SetSpeechRecognitionInitialSilenceTimeoutAction['payload']['initialSilenceTimeout']
): SetSpeechRecognitionInitialSilenceTimeoutAction {
  return {
    payload: { initialSilenceTimeout },
    type: SET_SPEECH_RECOGNITION_INITIAL_SILENCE_TIMEOUT
  };
}

export { SET_SPEECH_RECOGNITION_INITIAL_SILENCE_TIMEOUT };
