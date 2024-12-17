const SET_SPEECH_SYNTHESIS_NATIVE_VOICES = 'SET_SPEECH_SYNTHESIS_NATIVE_VOICES' as const;

export type SetSpeechSynthesisNativeVoicesAction = Readonly<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Readonly<{ voices: any[] }>;
  type: typeof SET_SPEECH_SYNTHESIS_NATIVE_VOICES;
}>;

export default function setSpeechSynthesisNativeVoices(
  voices: SetSpeechSynthesisNativeVoicesAction['payload']['voices']
): SetSpeechSynthesisNativeVoicesAction {
  return {
    payload: Object.freeze({ voices }),
    type: SET_SPEECH_SYNTHESIS_NATIVE_VOICES
  };
}

export { SET_SPEECH_SYNTHESIS_NATIVE_VOICES };
