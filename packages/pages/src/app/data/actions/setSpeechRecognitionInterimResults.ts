const SET_SPEECH_RECOGNITION_INTERIM_RESULTS = 'SET_SPEECH_RECOGNITION_INTERIM_RESULTS' as const;

export type SetSpeechRecognitionInterimResultsAction = Readonly<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Readonly<{ interimResults: any[] }>;
  type: typeof SET_SPEECH_RECOGNITION_INTERIM_RESULTS;
}>;

export default function setSpeechRecognitionInterimResults(
  interimResults: SetSpeechRecognitionInterimResultsAction['payload']['interimResults']
): SetSpeechRecognitionInterimResultsAction {
  return {
    payload: Object.freeze({ interimResults }),
    type: SET_SPEECH_RECOGNITION_INTERIM_RESULTS
  };
}

export { SET_SPEECH_RECOGNITION_INTERIM_RESULTS };
