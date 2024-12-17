const SET_SPEECH_SYNTHESIS_VOICE_URI = 'SET_SPEECH_SYNTHESIS_VOICE_URI' as const;

export type SetSpeechSynthesisVoiceURIAction = Readonly<{
  payload: Readonly<{ voiceURI: string }>;
  type: typeof SET_SPEECH_SYNTHESIS_VOICE_URI;
}>;

export default function setSpeechSynthesisVoiceURI(
  voiceURI: SetSpeechSynthesisVoiceURIAction['payload']['voiceURI']
): SetSpeechSynthesisVoiceURIAction {
  return {
    payload: Object.freeze({ voiceURI }),
    type: SET_SPEECH_SYNTHESIS_VOICE_URI
  };
}

export { SET_SPEECH_SYNTHESIS_VOICE_URI };
