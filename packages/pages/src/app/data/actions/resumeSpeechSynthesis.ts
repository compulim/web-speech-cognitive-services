const RESUME_SPEECH_SYNTHESIS = 'RESUME_SPEECH_SYNTHESIS' as const;

export type ResumeSpeechSynthesisAction = Readonly<{ type: typeof RESUME_SPEECH_SYNTHESIS }>;

export default function resumeSpeechSynthesis(): ResumeSpeechSynthesisAction {
  return Object.freeze({ type: RESUME_SPEECH_SYNTHESIS });
}

export { RESUME_SPEECH_SYNTHESIS };
