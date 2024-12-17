const SET_SPEECH_RECOGNITION_DELAYED_START = 'SET_SPEECH_RECOGNITION_DELAYED_START' as const;

export type SetSpeechRecongitionDelayedStartAction = Readonly<{
  payload: Readonly<{ delay: number }>;
  type: typeof SET_SPEECH_RECOGNITION_DELAYED_START;
}>;

export default function setSpeechRecognitionDelayedStart(
  delay: SetSpeechRecongitionDelayedStartAction['payload']['delay']
): SetSpeechRecongitionDelayedStartAction {
  return {
    payload: Object.freeze({ delay }),
    type: SET_SPEECH_RECOGNITION_DELAYED_START
  };
}

export { SET_SPEECH_RECOGNITION_DELAYED_START };
