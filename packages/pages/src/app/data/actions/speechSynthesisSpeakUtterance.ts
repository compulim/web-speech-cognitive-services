const SPEECH_SYNTHESIS_SPEAK_UTTERANCE = 'SPEECH_SYNTHESIS_SPEAK_UTTERANCE' as const;

export type SpeechSynthesisSpeakUtteranceAction = Readonly<{
  payload: Readonly<{ utterance: string }>;
  type: typeof SPEECH_SYNTHESIS_SPEAK_UTTERANCE;
}>;

export default function speechSynthesisSpeakUtterance(
  utterance: SpeechSynthesisSpeakUtteranceAction['payload']['utterance']
): SpeechSynthesisSpeakUtteranceAction {
  return {
    payload: Object.freeze({ utterance }),
    type: SPEECH_SYNTHESIS_SPEAK_UTTERANCE
  };
}

export { SPEECH_SYNTHESIS_SPEAK_UTTERANCE };
