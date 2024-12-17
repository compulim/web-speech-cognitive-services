const SET_SPEECH_RECOGNITION_MAX_ALTERNATIVES = 'SET_SPEECH_RECOGNITION_MAX_ALTERNATIVES' as const;

export type SetSpeechRecognitionMaxAlternativesAction = Readonly<{
  type: typeof SET_SPEECH_RECOGNITION_MAX_ALTERNATIVES;
  payload: Readonly<{ maxAlternatives: number }>;
}>;

export default function setSpeechRecognitionMaxAlternatives(
  maxAlternatives: number
): SetSpeechRecognitionMaxAlternativesAction {
  return Object.freeze({
    payload: Object.freeze({ maxAlternatives }),
    type: SET_SPEECH_RECOGNITION_MAX_ALTERNATIVES
  });
}

export { SET_SPEECH_RECOGNITION_MAX_ALTERNATIVES };
