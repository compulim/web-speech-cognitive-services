const SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION = 'SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION' as const;

export type SetSpeechRecognitionTextNormalizationAction = Readonly<{
  payload: Readonly<{ textNormalization: string }>;
  type: typeof SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION;
}>;

export default function setSpeechRecognitionTextNormalization(
  textNormalization: SetSpeechRecognitionTextNormalizationAction['payload']['textNormalization']
): SetSpeechRecognitionTextNormalizationAction {
  return {
    payload: Object.freeze({ textNormalization }),
    type: SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION
  };
}

export { SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION };
