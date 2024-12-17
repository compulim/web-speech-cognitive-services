const CANCEL_SPEECH_SYNTHESIS = 'CANCEL_SPEECH_SYNTHESIS' as const;

export type CancelSpeechSynthesisAction = Readonly<{ type: typeof CANCEL_SPEECH_SYNTHESIS }>;

export default function cancelSpeechSynthesis(): CancelSpeechSynthesisAction {
  return Object.freeze({ type: CANCEL_SPEECH_SYNTHESIS });
}

export { CANCEL_SPEECH_SYNTHESIS };
