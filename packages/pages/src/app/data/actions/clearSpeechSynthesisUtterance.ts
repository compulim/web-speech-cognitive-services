const CLEAR_SPEECH_SYNTHESIS_UTTERANCE = 'CLEAR_SPEECH_SYNTHESIS_UTTERANCE' as const;

export type ClearSpeechSynthesisUtteranceAction = Readonly<{ type: typeof CLEAR_SPEECH_SYNTHESIS_UTTERANCE }>;

export default function clearSpeechSynthesisUtterance(): ClearSpeechSynthesisUtteranceAction {
  return Object.freeze({ type: CLEAR_SPEECH_SYNTHESIS_UTTERANCE });
}

export { CLEAR_SPEECH_SYNTHESIS_UTTERANCE };
