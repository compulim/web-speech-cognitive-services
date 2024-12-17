const ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE = 'ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE' as const;

export type AddSpeechSynthesisNativeUtteranceAction = Readonly<{
  payload: Readonly<{
    nativeUtterance: string;
  }>;
  type: typeof ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE;
}>;

export default function addSpeechSynthesisNativeUtterance(
  nativeUtterance: AddSpeechSynthesisNativeUtteranceAction['payload']['nativeUtterance']
): AddSpeechSynthesisNativeUtteranceAction {
  return Object.freeze({
    payload: { nativeUtterance },
    type: ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE
  });
}

export { ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE };
