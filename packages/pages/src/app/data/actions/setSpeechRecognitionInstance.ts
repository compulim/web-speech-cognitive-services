const SET_SPEECH_RECOGNITION_INSTANCE = 'SET_SPEECH_RECOGNITION_INSTANCE' as const;

export type SetSpeechRecognitionInstanceAction = Readonly<{
  payload: Readonly<{ speechRecognition: SpeechRecognition }>;
  type: typeof SET_SPEECH_RECOGNITION_INSTANCE;
}>;

export default function setSpeechRecognitionInstance(
  speechRecognition: SetSpeechRecognitionInstanceAction['payload']['speechRecognition']
): SetSpeechRecognitionInstanceAction {
  return Object.freeze({
    payload: Object.freeze({ speechRecognition }),
    type: SET_SPEECH_RECOGNITION_INSTANCE
  });
}

export { SET_SPEECH_RECOGNITION_INSTANCE };
