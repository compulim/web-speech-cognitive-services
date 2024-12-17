const SET_SPEECH_SYNTHESIS_OUTPUT_FORMAT = 'SET_SPEECH_SYNTHESIS_OUTPUT_FORMAT' as const;

export type SetSpeechSynthesisOutputFormat = Readonly<{
  payload: Readonly<{ outputFormat: string }>;
  type: typeof SET_SPEECH_SYNTHESIS_OUTPUT_FORMAT;
}>;

export default function setSpeechSynthesisOutputFormat(
  outputFormat: SetSpeechSynthesisOutputFormat['payload']['outputFormat']
): SetSpeechSynthesisOutputFormat {
  return Object.freeze({
    payload: Object.freeze({ outputFormat }),
    type: SET_SPEECH_SYNTHESIS_OUTPUT_FORMAT
  });
}

export { SET_SPEECH_SYNTHESIS_OUTPUT_FORMAT };
