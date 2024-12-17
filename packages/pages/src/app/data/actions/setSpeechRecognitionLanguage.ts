const SET_SPEECH_RECOGNITION_LANGUAGE = 'SET_SPEECH_RECOGNITION_LANGUAGE' as const;

export type SetSpeechRecognitionLanguageAction = Readonly<{
  payload: Readonly<{ language: string }>;
  type: typeof SET_SPEECH_RECOGNITION_LANGUAGE;
}>;

export default function setSpeechRecognitionLanguage(
  language: SetSpeechRecognitionLanguageAction['payload']['language']
): SetSpeechRecognitionLanguageAction {
  return {
    payload: Object.freeze({ language }),
    type: SET_SPEECH_RECOGNITION_LANGUAGE
  };
}

export { SET_SPEECH_RECOGNITION_LANGUAGE };
