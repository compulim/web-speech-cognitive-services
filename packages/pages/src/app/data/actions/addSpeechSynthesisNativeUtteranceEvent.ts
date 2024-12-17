const ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE_EVENT = 'ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE_EVENT' as const;

export type AddSpeechSynthesisNativeUtteranceEventAction = Readonly<{
  payload: Readonly<{
    event: string;
    utteranceID: string;
  }>;
  type: typeof ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE_EVENT;
}>;

export default function addSpeechSynthesisNativeUtteranceEvent(
  utteranceID: AddSpeechSynthesisNativeUtteranceEventAction['payload']['utteranceID'],
  event: AddSpeechSynthesisNativeUtteranceEventAction['payload']['event']
): AddSpeechSynthesisNativeUtteranceEventAction {
  return Object.freeze({
    payload: Object.freeze({
      event,
      utteranceID
    }),
    type: ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE_EVENT
  });
}

export { ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE_EVENT };
