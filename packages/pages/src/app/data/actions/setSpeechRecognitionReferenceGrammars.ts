const SET_SPEECH_RECOGNITION_REFERENCE_GRAMMARS = 'SET_SPEECH_RECOGNITION_REFERENCE_GRAMMARS' as const;

export type SetSpeechRecognitionReferenceGrammarsAction = Readonly<{
  payload: Readonly<{ referenceGrammars: string[] }>;
  type: typeof SET_SPEECH_RECOGNITION_REFERENCE_GRAMMARS;
}>;

export default function setSpeechRecognitionReferenceGrammars(
  referenceGrammars: SetSpeechRecognitionReferenceGrammarsAction['payload']['referenceGrammars']
): SetSpeechRecognitionReferenceGrammarsAction {
  return {
    payload: Object.freeze({ referenceGrammars }),
    type: SET_SPEECH_RECOGNITION_REFERENCE_GRAMMARS
  };
}

export { SET_SPEECH_RECOGNITION_REFERENCE_GRAMMARS };
