const SET_SPEECH_SYNTHESIS_TEXT = 'SET_SPEECH_SYNTHESIS_TEXT' as const;

export type SetSpeechSynthesisText = Readonly<{
  payload: Readonly<{ text: string }>;
  type: typeof SET_SPEECH_SYNTHESIS_TEXT;
}>;

export default function setSpeechSynthesisText(
  text: SetSpeechSynthesisText['payload']['text']
): SetSpeechSynthesisText {
  return {
    payload: Object.freeze({ text }),
    type: SET_SPEECH_SYNTHESIS_TEXT
  };
}

export { SET_SPEECH_SYNTHESIS_TEXT };
