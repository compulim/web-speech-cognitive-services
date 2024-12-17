const PAUSE_SPEECH_SYNTHESIS = 'PAUSE_SPEECH_SYNTHESIS' as const;

export type PauseSpeechSynthesisAction = { type: typeof PAUSE_SPEECH_SYNTHESIS };

export default function pauseSpeechSynthesis(): PauseSpeechSynthesisAction {
  return Object.freeze({ type: PAUSE_SPEECH_SYNTHESIS });
}

export { PAUSE_SPEECH_SYNTHESIS };
