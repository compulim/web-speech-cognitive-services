const SET_SPEECH_RECOGNITION_CONTINUOUS = 'SET_SPEECH_RECOGNITION_CONTINUOUS' as const;

export type SetSpeechRecognitionContinuousAction = Readonly<{
  payload: Readonly<{ continuous: boolean }>;
  type: typeof SET_SPEECH_RECOGNITION_CONTINUOUS;
}>;

export default function setSpeechRecognitionContinuous(
  continuous: SetSpeechRecognitionContinuousAction['payload']['continuous']
): SetSpeechRecognitionContinuousAction {
  return Object.freeze({
    payload: Object.freeze({ continuous }),
    type: SET_SPEECH_RECOGNITION_CONTINUOUS
  });
}

export { SET_SPEECH_RECOGNITION_CONTINUOUS };
