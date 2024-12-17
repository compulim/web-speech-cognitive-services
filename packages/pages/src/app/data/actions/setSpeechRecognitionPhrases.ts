const SET_SPEECH_RECOGNITION_PHRASES = 'SET_SPEECH_RECOGNITION_PHRASES' as const;

export type SetSpeechRecognitionPhrasesAction = Readonly<{
  payload: Readonly<{ phrases: readonly string[] }>;
  type: typeof SET_SPEECH_RECOGNITION_PHRASES;
}>;

export default function setSpeechRecognitionPhrases(
  phrases: SetSpeechRecognitionPhrasesAction['payload']['phrases']
): SetSpeechRecognitionPhrasesAction {
  return {
    payload: Object.freeze({ phrases }),
    type: SET_SPEECH_RECOGNITION_PHRASES
  };
}

export { SET_SPEECH_RECOGNITION_PHRASES };
