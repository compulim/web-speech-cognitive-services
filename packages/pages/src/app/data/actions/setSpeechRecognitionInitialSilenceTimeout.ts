const SET_SPEECH_RECOGNITION_INITIAL_SILENCE_TIMEOUT = 'SET_SPEECH_RECOGNITION_INITIAL_SILENCE_TIMEOUT';

export type SpeechRecognitionInitialSilenceTimeoutAction = {
  payload: { initialSilenceTimeout: 'default' | number };
  type: typeof SET_SPEECH_RECOGNITION_INITIAL_SILENCE_TIMEOUT;
};

export default function setSpeechRecognitionInitialSilenceTimeout(
  initialSilenceTimeout: SpeechRecognitionInitialSilenceTimeoutAction['payload']['initialSilenceTimeout']
): SpeechRecognitionInitialSilenceTimeoutAction {
  return {
    type: SET_SPEECH_RECOGNITION_INITIAL_SILENCE_TIMEOUT,
    payload: { initialSilenceTimeout }
  };
}

export { SET_SPEECH_RECOGNITION_INITIAL_SILENCE_TIMEOUT };
